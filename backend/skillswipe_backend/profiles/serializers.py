from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import DeveloperProfile, CompanyProfile, CompanyUsers
from .utils import calculate_developer_profile_completion, calculate_company_profile_completion  # Import shared logic

User = get_user_model()


class DeveloperProfileSerializer(serializers.ModelSerializer):
    """Serializer for developer profile with validation"""
    
    # Read-only fields from user
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    user_status = serializers.CharField(source='user.status', read_only=True)
    
    # Calculated fields - USING SHARED LOGIC
    profile_completion = serializers.SerializerMethodField()
    
    class Meta:
        model = DeveloperProfile
        fields = [
            'id', 'username', 'email', 'user_status',
            'name', 'bio', 'city', 'current_location', 'experience_years',
            'top_languages', 'tools', 'ides', 'databases', 'operating_systems',
            'domains', 'clouds', 'certifications', 'awards', 'open_source',
            'job_preferences', 'salary_expectation_min', 'salary_expectation_max',
            'willing_to_relocate', 'top_two_cities',
            'github', 'leetcode', 'github_for_geeks', 'hackerrank',
            'profile_completion', 'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'username', 'email', 'user_status', 'profile_completion', 'last_updated', 'created_at']

    def get_profile_completion(self, obj):
        """Use shared utility function - NO DUPLICATION"""
        return calculate_developer_profile_completion(obj)

    def validate_name(self, value):
        """Validate name field"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters long")
        return value.strip()

    def validate_experience_years(self, value):
        """Validate experience years"""
        if value is not None and (value < 0 or value > 50):
            raise serializers.ValidationError("Experience years must be between 0 and 50")
        return value

    def validate_top_languages(self, value):
        """Validate programming languages"""
        if value and len(value) > 2:
            raise serializers.ValidationError("Maximum 2 top languages allowed")
        return value

    def validate_salary_expectation_min(self, value):
        """Validate minimum salary"""
        if value is not None and value < 0:
            raise serializers.ValidationError("Salary expectation must be positive")
        return value

    def validate(self, attrs):
        """Cross-field validation"""
        salary_min = attrs.get('salary_expectation_min')
        salary_max = attrs.get('salary_expectation_max')
        
        if salary_min and salary_max and salary_min > salary_max:
            raise serializers.ValidationError({
                'salary_expectation_max': 'Maximum salary must be greater than minimum salary'
            })
        
        return attrs

    def update(self, instance, validated_data):
        """Update profile and track update time"""
        profile = super().update(instance, validated_data)
        
        # Update user's last_profile_update (business logic - not duplication)
        profile.user.last_profile_update = profile.last_updated
        profile.user.save(update_fields=['last_profile_update'])
        
        return profile


class DeveloperProfileCreateSerializer(DeveloperProfileSerializer):
    """Serializer for creating developer profile"""
    
    class Meta(DeveloperProfileSerializer.Meta):
        fields = [
            'name', 'bio', 'city', 'current_location', 'experience_years',
            'top_languages', 'tools', 'ides', 'databases', 'operating_systems',
            'domains', 'clouds', 'certifications', 'awards', 'open_source',
            'job_preferences', 'salary_expectation_min', 'salary_expectation_max',
            'willing_to_relocate', 'top_two_cities',
            'github', 'leetcode', 'github_for_geeks', 'hackerrank'
        ]

    def create(self, validated_data):
        """Create developer profile for authenticated user"""
        user = self.context['request'].user
        
        # Check if user already has a profile
        if hasattr(user, 'developer_profile'):
            raise serializers.ValidationError("Developer profile already exists")
        
        # Check if user has correct role (defensive validation - not duplication)
        if user.role != 'developer':
            raise serializers.ValidationError("Only developers can create developer profiles")
        
        validated_data['user'] = user
        return super().create(validated_data)


class DeveloperProfilePublicSerializer(serializers.ModelSerializer):
    """Public serializer for developer profiles (for swiping/viewing)"""
    
    username = serializers.CharField(source='user.username', read_only=True)
    profile_completion = serializers.SerializerMethodField()
    
    class Meta:
        model = DeveloperProfile
        fields = [
            'id', 'username', 'name', 'bio', 'current_location', 'experience_years',
            'top_languages', 'tools', 'domains', 'certifications',
            'willing_to_relocate', 'top_two_cities', 'github',
            'profile_completion', 'created_at'
        ]

    def get_profile_completion(self, obj):
        """Use shared utility function - NO DUPLICATION"""
        return calculate_developer_profile_completion(obj)


class CompanyProfileSerializer(serializers.ModelSerializer):
    """Serializer for company profile with validation"""
    
    # User information
    created_by_username = serializers.CharField(source='created_by_user.username', read_only=True)
    created_by_email = serializers.CharField(source='created_by_user.email', read_only=True)
    
    # Company users count
    total_users = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyProfile
        fields = [
            'id', 'created_by_username', 'created_by_email',
            'name', 'about', 'website', 'location', 'linkedin_url', 'logo_url',
            'total_users', 'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'created_by_username', 'created_by_email', 'total_users', 'last_updated', 'created_at']

    def get_total_users(self, obj):
        """Get total users in this company"""
        return obj.users.count()

    def validate_name(self, value):
        """Validate company name"""
        if not value or len(value.strip()) < 2:
            raise serializers.ValidationError("Company name must be at least 2 characters long")
        return value.strip()

    def validate_website(self, value):
        """Validate website URL"""
        if value and not value.startswith(('http://', 'https://')):
            raise serializers.ValidationError("Website must start with http:// or https://")
        return value

    def validate_linkedin_url(self, value):
        """Validate LinkedIn URL"""
        if value and 'linkedin.com' not in value:
            raise serializers.ValidationError("Please enter a valid LinkedIn URL")
        return value


class CompanyProfileCreateSerializer(CompanyProfileSerializer):
    """Serializer for creating company profile"""
    
    class Meta(CompanyProfileSerializer.Meta):
        fields = ['name', 'about', 'website', 'location', 'linkedin_url', 'logo_url']

    def create(self, validated_data):
        """Create company profile and associate user"""
        user = self.context['request'].user
        
        # Check if user has correct role (defensive validation - not duplication)
        if user.role != 'company':
            raise serializers.ValidationError("Only company users can create company profiles")
        
        # Check if user is already part of a company
        if user.company_memberships.exists():
            raise serializers.ValidationError("User is already associated with a company")
        
        # Create company profile
        validated_data['created_by_user'] = user
        company = super().create(validated_data)
        
        # Add user to company
        CompanyUsers.objects.create(
            user=user,
            company=company,
            role='admin'  # Creator becomes admin
        )
        
        return company


class CompanyProfilePublicSerializer(serializers.ModelSerializer):
    """Public serializer for company profiles (for swiping/viewing)"""
    
    total_users = serializers.SerializerMethodField()
    
    class Meta:
        model = CompanyProfile
        fields = [
            'id', 'name', 'about', 'location', 'website', 'linkedin_url',
            'total_users', 'created_at'
        ]

    def get_total_users(self, obj):
        """Get total users in this company"""
        return obj.users.count()


class CompanyUsersSerializer(serializers.ModelSerializer):
    """Serializer for company users management"""
    
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = CompanyUsers
        fields = ['id', 'username', 'email', 'role', 'joined_at']
        read_only_fields = ['id', 'username', 'email', 'joined_at']