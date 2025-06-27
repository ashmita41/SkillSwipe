from django.urls import path
from .views import SwipeAPIView, DiscoverAPIView, DashboardAPIView

urlpatterns = [
    # Swipe actions
    path('swipe/', SwipeAPIView.as_view(), name='swipe-action'),
    
    # Discovery (cards to swipe on)
    path('discover/', DiscoverAPIView.as_view(), name='discover-cards'),
    
    # Dashboard with tabs
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
]