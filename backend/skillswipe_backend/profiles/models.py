import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.fields import ArrayField


User = get_user_model()


class DeveloperProfile(models.Model):
    """
    Developer profile with technical skills and job preferences.
    One-to-one relationship with User model.
    """
    
    # Experience level choices
    EXPERIENCE_CHOICES = [
        ('entry', 'Entry Level (0-2 years)'),
        ('mid', 'Mid Level (2-5 years)'),
        ('senior', 'Senior Level (5-10 years)'),
        ('lead', 'Lead/Principal (10+ years)'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # One-to-one relationship with User
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE,
        related_name='developer_profile'
    )
    
    # Basic Information
    name = models.CharField(max_length=255)
    bio = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    current_location = models.CharField(max_length=100, blank=True, null=True)
    experience_years = models.PositiveIntegerField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(30)]
    )
    
    # Technical Skills (using ArrayField for PostgreSQL)
    top_languages = ArrayField(
        models.CharField(max_length=50),
        size=2,  # Limit to top 2
        blank=True,
        default=list,
        help_text="Top 2 programming languages"
    )
    
    tools = ArrayField(
        models.CharField(max_length=50),
        size=2,
        blank=True,
        default=list,
        help_text="Top 2 tools/frameworks"
    )
    
    ides = ArrayField(
        models.CharField(max_length=50),
        size=2,
        blank=True,
        default=list,
        help_text="Top 2 IDEs"
    )
    
    databases = ArrayField(
        models.CharField(max_length=50),
        size=2,
        blank=True,
        default=list,
        help_text="Top 2 databases"
    )
    
    operating_systems = ArrayField(
        models.CharField(max_length=50),
        size=2,
        blank=True,
        default=list,
        help_text="Top 2 operating systems"
    )
    
    domains = ArrayField(
        models.CharField(max_length=50),
        size=2,
        blank=True,
        default=list,
        help_text="Top 2 domain expertise"
    )
    
    clouds = ArrayField(
        models.CharField(max_length=50),
        size=2,
        blank=True,
        default=list,
        help_text="Top 2 cloud platforms"
    )
    
    # Achievements
    certifications = models.TextField(blank=True, null=True)
    awards = models.TextField(blank=True, null=True)
    open_source = models.TextField(blank=True, null=True)
    
    # Job Preferences (JSON field for flexibility)
    job_preferences = models.JSONField(
        default=dict,
        blank=True,
        help_text="Job preferences including job types, work modes, etc."
    )
    
    # Salary expectations
    salary_expectation_min = models.PositiveIntegerField(
        blank=True, 
        null=True,
        help_text="Minimum salary expectation in local currency"
    )
    salary_expectation_max = models.PositiveIntegerField(
        blank=True, 
        null=True,
        help_text="Maximum salary expectation in local currency"
    )
    
    # Location Preferences
    willing_to_relocate = models.BooleanField(default=False)
    top_two_cities = ArrayField(
        models.CharField(max_length=100),
        size=2,
        blank=True,
        default=list,
        help_text="Top 2 preferred cities"
    )
    
    # Profile Links
    github = models.URLField(blank=True, null=True)
    leetcode = models.URLField(blank=True, null=True)
    github_for_geeks = models.URLField(blank=True, null=True)
    hackerrank = models.URLField(blank=True, null=True)
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'developer_profile'
        indexes = [
            models.Index(fields=['user'], name='idx_dev_profile_user'),
            models.Index(fields=['current_location'], name='idx_dev_profile_location'),
            models.Index(fields=['experience_years'], name='idx_dev_profile_exp'),
        ]
    
    def __str__(self):
        return f"{self.name} - {self.user.username}"
    
    def update_profile_timestamp(self):
        """Update both profile and user's last_profile_update"""
        self.user.last_profile_update = self.last_updated
        self.user.save(update_fields=['last_profile_update'])


class CompanyProfile(models.Model):
    """
    Company profile that can be shared across multiple HR users.
    Many-to-many relationship with User through CompanyUsers.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Company creator (the first user who created this company profile)
    created_by_user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,  # Don't delete company if creator is deleted
        related_name='created_companies'
    )
    
    # Company Information
    name = models.CharField(max_length=255)
    about = models.TextField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    linkedin_url = models.URLField(blank=True, null=True)
    logo_url = models.URLField(blank=True, null=True)
    
    # Timestamps
    last_updated = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'company_profile'
    
    def __str__(self):
        return self.name


class CompanyUsers(models.Model):
    """
    Junction table allowing multiple HR users under same company.
    """
    
    ROLE_CHOICES = [
        ('hr', 'HR'),
        ('admin', 'Admin'),
        ('recruiter', 'Recruiter'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='company_memberships'
    )
    
    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.CASCADE,
        related_name='users'
    )
    
    role = models.CharField(
        max_length=50,
        choices=ROLE_CHOICES,
        default='hr'
    )
    
    joined_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'company_users'
        unique_together = ['user', 'company']  # Ensure unique user-company combination
        
    def __str__(self):
        return f"{self.user.username} - {self.company.name} ({self.role})"