from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Router for viewsets
router = DefaultRouter()
router.register(r'jobs', views.JobPostingViewSet, basename='job-posting')
router.register(r'wishlist', views.WishlistViewSet, basename='wishlist')

urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
]