from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Custom User admin interface"""
    
    # Fields to display in the list view
    list_display = ('username', 'email', 'role', 'status', 'is_active', 'last_ping', 'date_joined')
    list_filter = ('role', 'status', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    # Add role and status fields to the form
    fieldsets = BaseUserAdmin.fieldsets + (
        ('SkillSwipe Info', {
            'fields': ('role', 'status', 'last_ping', 'last_profile_update')
        }),
    )
    
    # Add role to the add form
    add_fieldsets = BaseUserAdmin.add_fieldsets + (
        ('SkillSwipe Info', {
            'fields': ('role',)
        }),
    )
    
    readonly_fields = ('last_ping', 'last_profile_update', 'created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()