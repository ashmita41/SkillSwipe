from django.contrib import admin
from .models import DeveloperProfile, CompanyProfile, CompanyUsers


@admin.register(DeveloperProfile)
class DeveloperProfileAdmin(admin.ModelAdmin):
    """Developer Profile admin interface"""
    
    list_display = ('name', 'user', 'experience_years', 'current_location', 'created_at')
    list_filter = ('experience_years', 'willing_to_relocate', 'created_at')
    search_fields = ('name', 'user__username', 'user__email', 'current_location', 'bio')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'name', 'bio', 'city', 'current_location', 'experience_years')
        }),
        ('Technical Skills', {
            'fields': ('top_languages', 'tools', 'ides', 'databases', 'operating_systems', 'domains', 'clouds'),
            'classes': ('collapse',)
        }),
        ('Achievements', {
            'fields': ('certifications', 'awards', 'open_source'),
            'classes': ('collapse',)
        }),
        ('Job Preferences', {
            'fields': ('job_preferences', 'salary_expectation_min', 'salary_expectation_max'),
            'classes': ('collapse',)
        }),
        ('Location Preferences', {
            'fields': ('willing_to_relocate', 'top_two_cities'),
            'classes': ('collapse',)
        }),
        ('Profile Links', {
            'fields': ('github', 'leetcode', 'github_for_geeks', 'hackerrank'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_updated'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ('created_at', 'last_updated')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    """Company Profile admin interface"""
    
    list_display = ('name', 'created_by_user', 'location', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('name', 'location', 'about', 'created_by_user__username')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Company Information', {
            'fields': ('created_by_user', 'name', 'about', 'location')
        }),
        ('Links', {
            'fields': ('website', 'linkedin_url', 'logo_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'last_updated'),
            'classes': ('collapse',)
        })
    )
    
    readonly_fields = ('created_at', 'last_updated')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by_user')


@admin.register(CompanyUsers)
class CompanyUsersAdmin(admin.ModelAdmin):
    """Company Users admin interface"""
    
    list_display = ('user', 'company', 'role', 'joined_at')
    list_filter = ('role', 'joined_at')
    search_fields = ('user__username', 'company__name', 'user__email')
    ordering = ('-joined_at',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user', 'company')