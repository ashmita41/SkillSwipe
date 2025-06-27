from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import SwipeActions, Match
from jobs.models import JobPosting
from profiles.models import DeveloperProfile, CompanyProfile

User = get_user_model()


class SwipeCreateSerializer(serializers.Serializer):
    """Serializer for creating swipe actions"""
    
    SWIPE_TYPE_CHOICES = [
        ('profile', 'Profile Swipe'),
        ('job', 'Job Swipe'),
    ]
    
    swipe_type = serializers.ChoiceField(choices=SWIPE_TYPE_CHOICES)
    target_user_id = serializers.UUIDField(required=False, help_text="Required for profile swipes")
    job_id = serializers.UUIDField(required=False, help_text="Required for job swipes")
    
    def validate(self, data):
        """Custom validation for swipe data"""
        swipe_type = data.get('swipe_type')
        target_user_id = data.get('target_user_id')
        job_id = data.get('job_id')
        
        # Validate required fields based on swipe type
        if swipe_type == 'profile' and not target_user_id:
            raise serializers.ValidationError("target_user_id is required for profile swipes")
        
        if swipe_type == 'job' and not job_id:
            raise serializers.ValidationError("job_id is required for job swipes")
        
        # Validate target user exists and has correct role
        if target_user_id:
            try:
                target_user = User.objects.get(id=target_user_id, is_active=True)
                data['target_user'] = target_user
                
                # Prevent self-swiping
                request = self.context.get('request')
                if request and request.user == target_user:
                    raise serializers.ValidationError("Cannot swipe on yourself")
                
                # Role-based validation
                if request and request.user.role == target_user.role:
                    raise serializers.ValidationError("Cannot swipe on users with the same role")
                    
            except User.DoesNotExist:
                raise serializers.ValidationError("Target user not found")
        
        # Validate job exists
        if job_id:
            try:
                job = JobPosting.objects.get(id=job_id, status='active')
                data['job'] = job
                
                # Only developers can swipe on jobs
                request = self.context.get('request')
                if request and request.user.role != 'developer':
                    raise serializers.ValidationError("Only developers can swipe on jobs")
                    
            except JobPosting.DoesNotExist:
                raise serializers.ValidationError("Job posting not found or inactive")
        
        return data
    
    def create(self, validated_data):
        """Create swipe action and check for matches"""
        request = self.context.get('request')
        swiper = request.user
        swipe_type = validated_data['swipe_type']
        
        if swipe_type == 'profile':
            target_user = validated_data['target_user']
            job = None
            swiped_on = target_user
        else:  # job swipe
            job = validated_data['job']
            target_user = job.created_by  # Company user who created the job
            swiped_on = target_user
        
        # Create swipe action
        try:
            swipe = SwipeActions.objects.create(
                swiper=swiper,
                swiped_on=swiped_on,
                job_post=job,
                swipe_type=swipe_type
            )
        except Exception as e:
            if 'unique_profile_swipe' in str(e) or 'unique_job_swipe' in str(e):
                raise serializers.ValidationError("You have already swiped on this item")
            raise serializers.ValidationError(f"Error creating swipe: {str(e)}")
        
        # Check for mutual match
        match, match_created = Match.create_if_mutual_swipe(
            swiper=swiper,
            swiped_on=swiped_on,
            job_post=job
        )
        
        return {
            'swipe': swipe,
            'match': match,
            'match_created': match_created
        }


class SwipeActionSerializer(serializers.ModelSerializer):
    """Serializer for viewing swipe actions"""
    
    swiper_username = serializers.CharField(source='swiper.username', read_only=True)
    swiped_on_username = serializers.CharField(source='swiped_on.username', read_only=True)
    job_title = serializers.CharField(source='job_post.title', read_only=True)
    company_name = serializers.CharField(source='job_post.company.name', read_only=True)
    
    class Meta:
        model = SwipeActions
        fields = [
            'id', 'swiper_username', 'swiped_on_username', 
            'job_title', 'company_name', 'swipe_type', 'timestamp'
        ]


class MatchSerializer(serializers.ModelSerializer):
    """Serializer for match data"""
    
    user_1_username = serializers.CharField(source='user_1.username', read_only=True)
    user_1_role = serializers.CharField(source='user_1.role', read_only=True)
    user_2_username = serializers.CharField(source='user_2.username', read_only=True)
    user_2_role = serializers.CharField(source='user_2.role', read_only=True)
    job_title = serializers.CharField(source='job_post.title', read_only=True)
    company_name = serializers.CharField(source='job_post.company.name', read_only=True)
    
    class Meta:
        model = Match
        fields = [
            'id', 'user_1_username', 'user_1_role', 'user_2_username', 'user_2_role',
            'job_title', 'company_name', 'status', 'matched_on'
        ]


class DashboardStatsSerializer(serializers.Serializer):
    """Serializer for dashboard statistics"""
    
    total_swipes_made = serializers.IntegerField()
    total_swipes_received = serializers.IntegerField()
    total_matches = serializers.IntegerField()
    active_matches = serializers.IntegerField()
    profile_completion = serializers.FloatField()
    recent_activity = serializers.ListField()