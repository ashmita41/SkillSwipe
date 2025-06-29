import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError
from django.contrib.postgres.fields import ArrayField
from profiles.models import CompanyProfile


User = get_user_model()


class JobPosting(models.Model):
    """
    Job posting model with comprehensive job details.
    """
    
    JOB_TYPE_CHOICES = [
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('intern', 'Internship'),
        ('contract', 'Contract'),
    ]
    
    WORK_MODE_CHOICES = [
        ('remote', 'Remote'),
        ('in-office', 'In Office'),
        ('hybrid', 'Hybrid'),
    ]
    
    EXPERIENCE_CHOICES = [
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead/Principal'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Closed'),
        ('draft', 'Draft'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Company relationship
    company = models.ForeignKey(
        CompanyProfile,
        on_delete=models.CASCADE,
        related_name='job_postings'
    )
    
    # Job Details
    title = models.CharField(max_length=255)
    description = models.TextField(help_text="Detailed job description")
    
    job_type = models.CharField(
        max_length=20,
        choices=JOB_TYPE_CHOICES,
        help_text="Type of employment"
    )
    
    work_mode = models.CharField(
        max_length=20,
        choices=WORK_MODE_CHOICES,
        help_text="Work arrangement"
    )
    
    # Technical Requirements
    tech_stack = ArrayField(
        models.CharField(max_length=50),
        help_text="Required technologies and skills"
    )
    
    location = models.CharField(
        max_length=255,
        help_text="Job location"
    )
    
    # Salary Information
    salary_min = models.PositiveIntegerField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(0)],
        help_text="Minimum salary range"
    )
    
    salary_max = models.PositiveIntegerField(
        blank=True, 
        null=True,
        validators=[MinValueValidator(0)],
        help_text="Maximum salary range"
    )
    
    # Experience Requirements
    experience_required = models.CharField(
        max_length=20,
        choices=EXPERIENCE_CHOICES,
        blank=True,
        null=True,
        help_text="Required experience level"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_jobs',
        help_text="User who created this job posting"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'job_posting'
        indexes = [
            models.Index(fields=['status', 'created_at'], name='idx_job_active'),
            models.Index(fields=['company', 'status'], name='idx_job_company'),
            models.Index(fields=['location', 'status'], name='idx_job_location'),
        ]
        ordering = ['-created_at']   # Latest jobs first
    
    def __str__(self):
        return f"{self.title} at {self.company.name}"
    
    @property
    def is_active(self):
        """Check if job posting is active"""
        return self.status == 'active'
    
    def close_job(self):
        """Close the job posting"""
        self.status = 'closed'
        self.save(update_fields=['status'])


class Wishlist(models.Model):
    """
    User's wishlist for saving jobs and profiles for later.
    """
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlists'
    )
    
    # Either job_post OR wishlisted_user should be set, not both
    job_post = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        related_name='wishlisted_by',
        null=True,
        blank=True
    )
    
    wishlisted_user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlisted_by_users',
        null=True,
        blank=True,
        help_text="User profile that was wishlisted"
    )
    
    saved_on = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'wishlist'
        indexes = [
            models.Index(fields=['user', 'saved_on'], name='idx_wishlist_user'),
        ]
        ordering = ['-saved_on']  # Latest saved first
        constraints = [
            models.CheckConstraint(
                check=models.Q(job_post__isnull=False) | models.Q(wishlisted_user__isnull=False),
                name='wishlist_has_job_or_user'
            ),
            models.CheckConstraint(
                check=~(models.Q(job_post__isnull=False) & models.Q(wishlisted_user__isnull=False)),
                name='wishlist_not_both_job_and_user'
            ),
            models.UniqueConstraint(
                fields=['user', 'job_post'],
                condition=models.Q(job_post__isnull=False),
                name='unique_user_job_wishlist'
            ),
            models.UniqueConstraint(
                fields=['user', 'wishlisted_user'],
                condition=models.Q(wishlisted_user__isnull=False),
                name='unique_user_profile_wishlist'
            )
        ]
    
    def clean(self):
        # Ensure exactly one of job_post or wishlisted_user is set
        if not self.job_post and not self.wishlisted_user:
            raise ValidationError("Either job_post or wishlisted_user must be set")
        if self.job_post and self.wishlisted_user:
            raise ValidationError("Cannot set both job_post and wishlisted_user")
        
        # Prevent self-wishlisting
        if self.wishlisted_user and self.user == self.wishlisted_user:
            raise ValidationError("Cannot wishlist yourself")
    
    @property
    def item_type(self):
        """Return the type of wishlisted item"""
        if self.job_post:
            return 'job'
        elif self.wishlisted_user:
            return 'profile'
        return 'unknown'
    
    def __str__(self):
        if self.job_post:
            return f"{self.user.username} -> Job: {self.job_post.title}"
        elif self.wishlisted_user:
            return f"{self.user.username} -> Profile: {self.wishlisted_user.username}"
        return f"{self.user.username} -> Unknown item"

