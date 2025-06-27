from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import DeveloperProfile, CompanyProfile, CompanyUsers
from .serializers import (
    DeveloperProfileSerializer, DeveloperProfileCreateSerializer, DeveloperProfilePublicSerializer,
    CompanyProfileSerializer, CompanyProfileCreateSerializer, CompanyProfilePublicSerializer,
    CompanyUsersSerializer
)


class DeveloperProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for developer profile management"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Optimize queries with select_related"""
        return DeveloperProfile.objects.select_related('user').all()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return DeveloperProfileCreateSerializer
        elif self.action in ['list', 'retrieve'] and not self.is_own_profile():
            return DeveloperProfilePublicSerializer
        return DeveloperProfileSerializer
    
    def is_own_profile(self):
        """Check if user is viewing their own profile"""
        if self.action == 'list':
            return False
        profile_id = self.kwargs.get('pk')
        if profile_id == 'me' or not profile_id:
            return True
        try:
            profile = self.get_queryset().get(pk=profile_id)
            return profile.user == self.request.user
        except DeveloperProfile.DoesNotExist:
            return False

    def create(self, request):
        """Create developer profile"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            profile = serializer.save()
            
            # Update user's last_profile_update
            request.user.last_profile_update = profile.last_updated
            request.user.save(update_fields=['last_profile_update'])
            
            return Response({
                'message': 'Developer profile created successfully',
                'profile': DeveloperProfileSerializer(profile).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Profile creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update own profile"""
        try:
            profile = request.user.developer_profile
        except DeveloperProfile.DoesNotExist:
            return Response({
                'message': 'Developer profile not found',
                'has_profile': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            serializer = DeveloperProfileSerializer(profile)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            partial = request.method == 'PATCH'
            serializer = DeveloperProfileSerializer(profile, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Profile updated successfully',
                    'profile': serializer.data
                })
            
            return Response({
                'message': 'Profile update failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        """List developer profiles for swiping (exclude own profile)"""
        queryset = self.get_queryset().exclude(user=request.user)
        
        # Filter by location if provided
        location = request.query_params.get('location')
        if location:
            queryset = queryset.filter(
                Q(current_location__icontains=location) | 
                Q(city__icontains=location)
            )
        
        # Filter by experience level
        experience = request.query_params.get('experience')
        if experience:
            if experience == 'entry':
                queryset = queryset.filter(experience_years__lte=2)
            elif experience == 'mid':
                queryset = queryset.filter(experience_years__range=(3, 5))
            elif experience == 'senior':
                queryset = queryset.filter(experience_years__gte=6)
        
        # Filter by programming language
        language = request.query_params.get('language')
        if language:
            queryset = queryset.filter(top_languages__contains=[language])
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    def retrieve(self, request, pk=None):
        """Get specific developer profile"""
        if pk == 'me':
            return self.me(request)
        
        profile = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)


class CompanyProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for company profile management"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Optimize queries"""
        return CompanyProfile.objects.select_related('created_by_user').prefetch_related('users').all()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return CompanyProfileCreateSerializer
        elif self.action in ['list', 'retrieve'] and not self.is_own_company():
            return CompanyProfilePublicSerializer
        return CompanyProfileSerializer
    
    def is_own_company(self):
        """Check if user is viewing their own company"""
        if self.action == 'list':
            return False
        company_id = self.kwargs.get('pk')
        if company_id == 'me' or not company_id:
            return True
        try:
            return self.request.user.company_memberships.filter(company_id=company_id).exists()
        except:
            return False

    def create(self, request):
        """Create company profile"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            company = serializer.save()
            
            return Response({
                'message': 'Company profile created successfully',
                'company': CompanyProfileSerializer(company).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Company creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['get', 'put', 'patch'])
    def me(self, request):
        """Get or update own company profile"""
        try:
            company_membership = request.user.company_memberships.first()
            if not company_membership:
                return Response({
                    'message': 'Not associated with any company',
                    'has_company': False
                }, status=status.HTTP_404_NOT_FOUND)
            
            company = company_membership.company
        except:
            return Response({
                'message': 'Company profile not found',
                'has_company': False
            }, status=status.HTTP_404_NOT_FOUND)
        
        if request.method == 'GET':
            serializer = CompanyProfileSerializer(company)
            return Response(serializer.data)
        
        elif request.method in ['PUT', 'PATCH']:
            # Check if user can update company (admin role)
            if company_membership.role not in ['admin', 'hr']:
                return Response({
                    'message': 'Permission denied. Only admin or HR can update company profile.'
                }, status=status.HTTP_403_FORBIDDEN)
            
            partial = request.method == 'PATCH'
            serializer = CompanyProfileSerializer(company, data=request.data, partial=partial)
            
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'message': 'Company profile updated successfully',
                    'company': serializer.data
                })
            
            return Response({
                'message': 'Company update failed',
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        """List company profiles for swiping"""
        queryset = self.get_queryset()
        
        # Exclude own company
        user_companies = request.user.company_memberships.values_list('company_id', flat=True)
        queryset = queryset.exclude(id__in=user_companies)
        
        # Filter by location
        location = request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    def retrieve(self, request, pk=None):
        """Get specific company profile"""
        if pk == 'me':
            return self.me(request)
        
        company = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(company)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def users(self, request, pk=None):
        """Get users in this company"""
        company = get_object_or_404(self.get_queryset(), pk=pk)
        
        # Check if user is part of this company
        if not request.user.company_memberships.filter(company=company).exists():
            return Response({
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        company_users = CompanyUsers.objects.filter(company=company).select_related('user')
        serializer = CompanyUsersSerializer(company_users, many=True)
        
        return Response({
            'company': company.name,
            'users': serializer.data
        })