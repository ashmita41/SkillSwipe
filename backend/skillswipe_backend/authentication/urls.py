from django.urls import path, include
from . import views

urlpatterns = [
    # Djoser authentication URLs
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    
    # Custom authentication endpoints
    path('login/', views.login_view, name='custom-login'),
    path('profile-status/', views.profile_status, name='profile-status'),
    path('ping/', views.update_activity, name='update-activity'),
    path('logout/', views.logout_view, name='custom-logout'),
]