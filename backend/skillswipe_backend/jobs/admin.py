from django.contrib import admin
from .models import JobPosting, Wishlist


@admin.register(JobPosting)
class JobPostingAdmin(admin.ModelAdmin):
    """Job Posting admin interface"""
    
    list_display = ('title', 'company', 'job_type', 'work_mode', 'status', 'created_by', 'created_at')
    list_filter = ('job_type', 'work_mode', 'status', 'experience_required', 'created_at')
    search_fields = ('title', 'description', 'company__name', 'location', 'tech_stack')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'created_by', 'title', 'description', 'status')
        }),
        ('Job Details', {
            'fields': ('job_type', 'work_mode', 'location', 'experience_required')
        }),
        ('Technical Requirements', {
            'fields': ('tech_stack',)
        }),
        ('Salary Information', {
            'fields': ('salary_min', 'salary_max'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('company', 'created_by')


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    """Wishlist admin interface"""
    
    list_display = ('user', 'job_post', 'saved_on')
    list_filter = ('saved_on',)
    search_fields = ('user__username', 'job_post__title', 'job_post__company__name')
    ordering = ('-saved_on',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'job_post', 'job_post__company')