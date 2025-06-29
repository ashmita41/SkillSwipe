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
    """Wishlist serializer for both jobs and profiles"""
    
    # Complete job object (when wishlisting a job)
    job_post = serializers.SerializerMethodField()
    # Complete user object (when wishlisting a user)
    wishlisted_user = serializers.SerializerMethodField()
    
    # Item type
    item_type = serializers.ReadOnlyField()
    
    class Meta:
        model = Wishlist
        fields = [
            'id', 'item_type', 'saved_on',
            'job_post', 'wishlisted_user'
        ]
        read_only_fields = [
            'id', 'item_type', 'saved_on',
            'job_post', 'wishlisted_user'
        ]
    
    def get_job_post(self, obj):
        """Return complete job data if this is a job wishlist item"""
        if obj.job_post:
            return JobPostingPublicSerializer(obj.job_post, context=self.context).data
        return None
    
    def get_wishlisted_user(self, obj):
        """Return complete user data if this is a profile wishlist item"""
        if obj.wishlisted_user:
            user = obj.wishlisted_user
            # Return different profile data based on user role
            if user.role == 'developer' and hasattr(user, 'developer_profile'):
                from profiles.serializers import DeveloperProfilePublicSerializer
                return DeveloperProfilePublicSerializer(user.developer_profile, context=self.context).data
            elif user.role == 'company' and user.company_memberships.exists():
                from profiles.serializers import CompanyProfilePublicSerializer
                company_profile = user.company_memberships.first().company
                return CompanyProfilePublicSerializer(company_profile, context=self.context).data
            else:
                # Fallback to basic user data
                return {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'first_name': user.first_name,
                    'last_name': user.last_name
                }
        return None


class WishlistCreateSerializer(serializers.ModelSerializer):
    """Serializer for adding jobs or profiles to wishlist"""
    
    job_post_id = serializers.UUIDField(write_only=True, required=False)
    wishlisted_user_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = Wishlist
        fields = ['job_post_id', 'wishlisted_user_id']

    def validate(self, attrs):
        """Validate that exactly one of job_post_id or wishlisted_user_id is provided and enforce role rules"""
        job_post_id = attrs.get('job_post_id')
        wishlisted_user_id = attrs.get('wishlisted_user_id')
        
        if not job_post_id and not wishlisted_user_id:
            raise serializers.ValidationError("Either job_post_id or wishlisted_user_id must be provided")
        
        if job_post_id and wishlisted_user_id:
            raise serializers.ValidationError("Cannot provide both job_post_id and wishlisted_user_id")
        
        # Enforce role-specific wishlist rules
        user = self.context['request'].user
        
        if user.role == 'developer':
            # Developers can only save jobs, not user profiles
            if wishlisted_user_id:
                raise serializers.ValidationError("Developers can only save jobs to wishlist, not user profiles")
        elif user.role == 'company':
            # Companies can only save developer profiles, not jobs
            if job_post_id:
                raise serializers.ValidationError("Companies can only save developer profiles to wishlist, not jobs")
        
        return attrs

    def validate_job_post_id(self, value):
        """Validate job exists and is active"""
        if value:
            try:
                job = JobPosting.objects.get(id=value)
                if job.status != 'active':
                    raise serializers.ValidationError("Can only wishlist active jobs")
                return value
            except JobPosting.DoesNotExist:
                raise serializers.ValidationError("Job not found")
        return value

    def validate_wishlisted_user_id(self, value):
        """Validate user exists and is active"""
        if value:
            try:
                user = User.objects.get(id=value, is_active=True)
                
                # Prevent self-wishlisting
                request_user = self.context['request'].user
                if user == request_user:
                    raise serializers.ValidationError("Cannot wishlist yourself")
                
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError("User not found or inactive")
        return value

    def create(self, validated_data):
        """Create wishlist entry with role validation"""
        user = self.context['request'].user
        job_post_id = validated_data.get('job_post_id')
        wishlisted_user_id = validated_data.get('wishlisted_user_id')
        
        if job_post_id:
            # This should only be for developers
            if user.role != 'developer':
                raise serializers.ValidationError("Only developers can save jobs")
                
            # Wishlisting a job
            try:
                job_post = JobPosting.objects.get(id=job_post_id)
            except JobPosting.DoesNotExist:
                raise serializers.ValidationError("Job not found")
            
            # Check if already wishlisted
            if Wishlist.objects.filter(user=user, job_post=job_post).exists():
                raise serializers.ValidationError("Job already in wishlist")
            
            return Wishlist.objects.create(user=user, job_post=job_post)
        
        elif wishlisted_user_id:
            # This should only be for companies
            if user.role != 'company':
                raise serializers.ValidationError("Only companies can save developer profiles")
                
            # Wishlisting a user profile
            try:
                wishlisted_user = User.objects.get(id=wishlisted_user_id)
                # Ensure it's a developer being wishlisted
                if wishlisted_user.role != 'developer':
                    raise serializers.ValidationError("Companies can only save developer profiles")
            except User.DoesNotExist:
                raise serializers.ValidationError("User not found")
            
            # Check if already wishlisted
            if Wishlist.objects.filter(user=user, wishlisted_user=wishlisted_user).exists():
                raise serializers.ValidationError("Profile already in wishlist")
            
            return Wishlist.objects.create(user=user, wishlisted_user=wishlisted_user)


class JobStatisticsSerializer(serializers.Serializer):
    """Serializer for job statistics"""
    
    total_jobs = serializers.IntegerField()
    active_jobs = serializers.IntegerField()
    draft_jobs = serializers.IntegerField()
    closed_jobs = serializers.IntegerField()
    total_applications = serializers.IntegerField()
    avg_match_score = serializers.FloatField()


