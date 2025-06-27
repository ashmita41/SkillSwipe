from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import JobPosting, Wishlist
from .utils import get_user_company_profile, can_user_manage_jobs, calculate_job_match_score
from profiles.models import CompanyProfile

User = get_user_model()


class JobPostingSerializer(serializers.ModelSerializer):
    """Complete job posting serializer for company management"""
    
    # Company information (read-only)
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_location = serializers.CharField(source='company.location', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    # Calculated fields
    total_applicants = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'company_name', 'company_location', 'created_by_username',
            'title', 'description', 'job_type', 'work_mode', 'tech_stack',
            'location', 'salary_min', 'salary_max', 'experience_required',
            'status', 'total_applicants', 'is_owner',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'company_name', 'company_location', 'created_by_username',
            'total_applicants', 'is_owner', 'created_at', 'updated_at'
        ]

    def get_total_applicants(self, obj):
        """Get total number of people who swiped on this job"""
        return obj.swipes.count() if hasattr(obj, 'swipes') else 0

    def get_is_owner(self, obj):
        """Check if current user can manage this job"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        can_manage, _ = can_user_manage_jobs(request.user, obj.company)
        return can_manage

    def validate_title(self, value):
        """Validate job title"""
        if not value or len(value.strip()) < 5:
            raise serializers.ValidationError("Job title must be at least 5 characters long")
        return value.strip()

    def validate_description(self, value):
        """Validate job description"""
        if not value or len(value.strip()) < 50:
            raise serializers.ValidationError("Job description must be at least 50 characters long")
        return value.strip()

    def validate_tech_stack(self, value):
        """Validate tech stack"""
        if not value or len(value) == 0:
            raise serializers.ValidationError("At least one technology is required")
        if len(value) > 10:
            raise serializers.ValidationError("Maximum 10 technologies allowed")
        return value

    def validate_salary_min(self, value):
        """Validate minimum salary"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Salary must be positive")
        return value

    def validate(self, attrs):
        """Cross-field validation"""
        salary_min = attrs.get('salary_min')
        salary_max = attrs.get('salary_max')
        
        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({
                'salary_max': 'Maximum salary must be greater than minimum salary'
            })
        
        return attrs


class JobPostingCreateSerializer(JobPostingSerializer):
    """Serializer for creating job postings"""
    
    class Meta(JobPostingSerializer.Meta):
        fields = [
            'title', 'description', 'job_type', 'work_mode', 'tech_stack',
            'location', 'salary_min', 'salary_max', 'experience_required', 'status'
        ]

    def create(self, validated_data):
        """Create job posting with company validation"""
        user = self.context['request'].user
        
        # Get user's company
        company = get_user_company_profile(user)
        if not company:
            raise serializers.ValidationError("User must have a company profile to create jobs")
        
        # Check permissions
        can_manage, error_msg = can_user_manage_jobs(user, company)
        if not can_manage:
            raise serializers.ValidationError(error_msg)
        
        # Set company and creator
        validated_data['company'] = company
        validated_data['created_by'] = user
        
        return super().create(validated_data)


class JobPostingPublicSerializer(serializers.ModelSerializer):
    """Public job posting serializer for swiping/viewing"""
    
    # Company information
    company_name = serializers.CharField(source='company.name', read_only=True)
    company_about = serializers.CharField(source='company.about', read_only=True)
    company_location = serializers.CharField(source='company.location', read_only=True)
    company_website = serializers.CharField(source='company.website', read_only=True)
    
    # Calculated fields
    match_score = serializers.SerializerMethodField()
    is_wishlisted = serializers.SerializerMethodField()
    
    class Meta:
        model = JobPosting
        fields = [
            'id', 'company_name', 'company_about', 'company_location', 'company_website',
            'title', 'description', 'job_type', 'work_mode', 'tech_stack',
            'location', 'salary_min', 'salary_max', 'experience_required',
            'match_score', 'is_wishlisted', 'created_at'
        ]

    def get_match_score(self, obj):
        """Calculate job match score for current user"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        user = request.user
        if user.role == 'developer' and hasattr(user, 'developer_profile'):
            return calculate_job_match_score(obj, user.developer_profile)
        
        return 0

    def get_is_wishlisted(self, obj):
        """Check if job is in user's wishlist"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        return Wishlist.objects.filter(user=request.user, job_post=obj).exists()


class WishlistSerializer(serializers.ModelSerializer):
    """Wishlist serializer"""
    
    # Job information
    job_title = serializers.CharField(source='job_post.title', read_only=True)
    job_company = serializers.CharField(source='job_post.company.name', read_only=True)
    job_location = serializers.CharField(source='job_post.location', read_only=True)
    job_type = serializers.CharField(source='job_post.job_type', read_only=True)
    
    class Meta:
        model = Wishlist
        fields = [
            'id', 'job_title', 'job_company', 'job_location', 'job_type',
            'saved_on'
        ]
        read_only_fields = ['id', 'job_title', 'job_company', 'job_location', 'job_type', 'saved_on']


class WishlistCreateSerializer(serializers.ModelSerializer):
    """Serializer for adding jobs to wishlist"""
    
    job_post_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['job_post_id']

    def validate_job_post_id(self, value):
        """Validate job exists and is active"""
        try:
            job = JobPosting.objects.get(id=value)
            if job.status != 'active':
                raise serializers.ValidationError("Can only wishlist active jobs")
            return value
        except JobPosting.DoesNotExist:
            raise serializers.ValidationError("Job not found")

    def create(self, validated_data):
        """Create wishlist entry"""
        user = self.context['request'].user
        job_post_id = validated_data['job_post_id']
        
        try:
            job_post = JobPosting.objects.get(id=job_post_id)
        except JobPosting.DoesNotExist:
            raise serializers.ValidationError("Job not found")
        
        # Check if already wishlisted
        if Wishlist.objects.filter(user=user, job_post=job_post).exists():
            raise serializers.ValidationError("Job already in wishlist")
        
        return Wishlist.objects.create(user=user, job_post=job_post)


class JobStatisticsSerializer(serializers.Serializer):
    """Serializer for job statistics"""
    
    total_jobs = serializers.IntegerField()
    active_jobs = serializers.IntegerField()
    draft_jobs = serializers.IntegerField()
    closed_jobs = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    avg_match_score = serializers.FloatField()