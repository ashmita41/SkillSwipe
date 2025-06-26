import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from jobs.models import JobPosting


User = get_user_model()


class SwipeActions(models.Model):
    """
    Records right swipes only (interest shown).
    Supports both profile swipes and job swipes.
    """
    
    SWIPE_TYPE_CHOICES = [
        ('profile', 'Profile Swipe'),
        ('job', 'Job Swipe'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Swiper (the one who swiped)
    swiper = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='swipes_made'
    )
    
    # Swiped on (can be User ID for profile swipes)
    swiped_on = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='swipes_received',
        help_text="User who was swiped on (for profile swipes)"
    )
    
    # Job context (optional, for job-related swipes)
    job_post = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='swipes',
        help_text="Job posting context (for job swipes)"
    )
    
    swipe_type = models.CharField(
        max_length=20,
        choices=SWIPE_TYPE_CHOICES,
        default='profile',
        help_text="Type of swipe: profile or job"
    )
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'swipe_actions'
        # Ensure unique swipe combinations
        constraints = [
            models.UniqueConstraint(
                fields=['swiper', 'swiped_on'],
                condition=models.Q(swipe_type='profile'),
                name='unique_profile_swipe'
            ),
            models.UniqueConstraint(
                fields=['swiper', 'job_post'],
                condition=models.Q(swipe_type='job'),
                name='unique_job_swipe'
            ),
        ]
        indexes = [
            models.Index(fields=['swiped_on', 'timestamp'], name='idx_swipe_swiped_on'),
            models.Index(fields=['swiper', 'job_post'], name='idx_swipe_swiper'),
            models.Index(fields=['timestamp'], name='idx_swipe_timestamp'),
        ]
        ordering = ['-timestamp']  # Latest swipes first
    
    def clean(self):
        """Custom validation"""
        # Prevent self-swiping
        if self.swiper == self.swiped_on:
            raise ValidationError("Users cannot swipe on themselves")
        
        # Validate swipe type consistency
        if self.swipe_type == 'job' and not self.job_post:
            raise ValidationError("Job post is required for job swipes")
        
        if self.swipe_type == 'profile' and self.job_post:
            raise ValidationError("Job post should not be specified for profile swipes")
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        if self.swipe_type == 'job':
            return f"{self.swiper.username} -> {self.job_post.title}"
        return f"{self.swiper.username} -> {self.swiped_on.username}"


class Match(models.Model):
    """
    Created when mutual swipe happens between two users.
    Enables chat functionality.
    """
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('archived', 'Archived'),
        ('blocked', 'Blocked'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # The two matched users (user_1_id should always be < user_2_id for consistency)
    user_1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='matches_as_user1'
    )
    
    user_2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='matches_as_user2'
    )
    
    # Job context
    job_post = models.ForeignKey(
        JobPosting,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='matches',
        help_text="Job posting that led to the match"
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='active'
    )
    
    matched_on = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'match'
        # Ensure no duplicate matches and ordered users
        constraints = [
            models.UniqueConstraint(
                fields=['user_1', 'user_2', 'job_post'],
                name='unique_match'
            ),
            models.CheckConstraint(
                check=models.Q(user_1__lt=models.F('user_2')),
                name='ordered_users'
            ),
        ]
        indexes = [
            models.Index(fields=['user_1', 'user_2'], name='idx_match_users'),
            models.Index(fields=['user_1', 'matched_on'], name='idx_match_user1'),
            models.Index(fields=['user_2', 'matched_on'], name='idx_match_user2'),
        ]
        ordering = ['-matched_on']  # Latest matches first
    
    def clean(self):
        """Custom validation"""
        if self.user_1 == self.user_2:
            raise ValidationError("Users cannot match with themselves")
        
        # Ensure user_1.id < user_2.id for consistency
        if self.user_1.id >= self.user_2.id:
            self.user_1, self.user_2 = self.user_2, self.user_1
    
    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
    
    def __str__(self):
        context = f" (via {self.job_post.title})" if self.job_post else ""
        return f"Match: {self.user_1.username} ↔ {self.user_2.username}{context}"
    
    @classmethod
    def create_if_mutual_swipe(cls, swiper, swiped_on, job_post=None):
        """
        Create a match if there's a mutual swipe.
        Returns (match_instance, created) tuple.
        """
        # Check if there's a reverse swipe
        reverse_swipe_exists = SwipeActions.objects.filter(
            swiper=swiped_on,
            swiped_on=swiper
        ).exists()
        
        if reverse_swipe_exists:
            # Ensure consistent ordering for user_1 and user_2
            user_1, user_2 = (swiper, swiped_on) if swiper.id < swiped_on.id else (swiped_on, swiper)
            
            match, created = cls.objects.get_or_create(
                user_1=user_1,
                user_2=user_2,
                job_post=job_post,
                defaults={'status': 'active'}
            )
            return match, created
        
        return None, False

