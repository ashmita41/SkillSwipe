from django.contrib import admin
from .models import SwipeActions, Match


@admin.register(SwipeActions)
class SwipeActionsAdmin(admin.ModelAdmin):
    """Swipe Actions admin interface"""
    
    list_display = ('swiper', 'swiped_on', 'swipe_type', 'job_post', 'timestamp')
    list_filter = ('swipe_type', 'timestamp')
    search_fields = ('swiper__username', 'swiped_on__username', 'job_post__title')
    ordering = ('-timestamp',)
    
    fieldsets = (
        ('Swipe Information', {
            'fields': ('swiper', 'swiped_on', 'swipe_type', 'job_post', 'timestamp')
        }),
    )
    
    readonly_fields = ('timestamp',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('swiper', 'swiped_on', 'job_post')


@admin.register(Match)
class MatchAdmin(admin.ModelAdmin):
    """Match admin interface"""
    
    list_display = ('user_1', 'user_2', 'job_post', 'status', 'matched_on')
    list_filter = ('status', 'matched_on')
    search_fields = ('user_1__username', 'user_2__username', 'job_post__title')
    ordering = ('-matched_on',)
    
    fieldsets = (
        ('Match Information', {
            'fields': ('user_1', 'user_2', 'job_post', 'status', 'matched_on')
        }),
    )
    
    readonly_fields = ('matched_on',)
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user_1', 'user_2', 'job_post')