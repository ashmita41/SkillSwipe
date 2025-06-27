import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser.
    Adds role-based authentication and activity tracking.
    """
    
    # Role choices
    ROLE_CHOICES = [
        ('developer', 'Developer'),
        ('company', 'Company'),
    ]
    
    # Status choices
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('pending', 'Pending'),
    ]
    
    # Primary key as UUID for better security
    id = models.UUIDField(
        primary_key=True, 
        default=uuid.uuid4, 
        editable=False
    )
    
    # Role field 
    role = models.CharField(
        max_length=20, 
        choices=ROLE_CHOICES,
        help_text="User role: developer or company"
    )
    
    # Status tracking fields
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='active',
        help_text="User activity status"
    )
    
    last_ping = models.DateTimeField(
        default=timezone.now,
        help_text="Last activity timestamp for 30-day inactive check"
    )
    
    last_profile_update = models.DateTimeField(
        default=timezone.now,
        help_text="Last profile update for 90-day review reminder"
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auth_user'  # Default table name
        indexes = [
            models.Index(fields=['status', 'last_ping'], name='idx_user_status_ping'),
            models.Index(fields=['role', 'status'], name='idx_user_role_status'),
        ]
    
    def __str__(self):
        return f"{self.username} ({self.role})"
    
    @property
    def is_developer(self):
        """Check if user is a developer"""
        return self.role == 'developer'
    
    @property
    def is_company(self):
        """Check if user is a company user"""
        return self.role == 'company'
    
    def update_last_ping(self):
        """Update last ping timestamp"""
        self.last_ping = timezone.now()
        self.save(update_fields=['last_ping'])
    
    def mark_inactive(self):
        """Mark user as inactive"""
        self.status = 'inactive'
        self.save(update_fields=['status'])
    
    def days_since_last_ping(self):
        """Calculate days since last ping"""
        return (timezone.now() - self.last_ping).days
    
    def days_since_profile_update(self):
        """Calculate days since last profile update"""
        return (timezone.now() - self.last_profile_update).days