from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router for viewsets
router = DefaultRouter()
router.register(r'developer', views.DeveloperProfileViewSet, basename='developer-profile')
router.register(r'company', views.CompanyProfileViewSet, basename='company-profile')

urlpatterns = [
    # Include router URLs
    path('profiles/', include(router.urls)),
]