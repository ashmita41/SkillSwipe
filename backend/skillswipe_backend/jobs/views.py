from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg
from .models import JobPosting, Wishlist
from .serializers import (
    JobPostingSerializer, JobPostingCreateSerializer, JobPostingPublicSerializer,
    WishlistSerializer, WishlistCreateSerializer, JobStatisticsSerializer
)
from .utils import get_user_company_profile, can_user_manage_jobs


class JobPostingViewSet(viewsets.ModelViewSet):
    """ViewSet for job posting management"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Optimize queries with select_related"""
        return JobPosting.objects.select_related('company', 'created_by').all()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return JobPostingCreateSerializer
        elif self.action in ['list', 'retrieve'] and not self.is_company_job_management():
            return JobPostingPublicSerializer
        return JobPostingSerializer
    
    def is_company_job_management(self):
        """Check if this is company managing their own jobs"""
        # Check URL pattern or query params to determine context
        manage_own = self.request.query_params.get('manage', '').lower() == 'true'
        return self.request.user.role == 'company' and manage_own

    def create(self, request):
        """Create job posting"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            job = serializer.save()
            
            return Response({
                'message': 'Job posting created successfully',
                'job': JobPostingSerializer(job, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Job creation failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        """List job postings with filtering"""
        queryset = self.get_queryset()
        
        # Check if company is managing their own jobs
        if self.is_company_job_management():
            company = get_user_company_profile(request.user)
            if company:
                queryset = queryset.filter(company=company)
            else:
                return Response({
                    'message': 'Company profile required',
                    'results': []
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Public job listing (for swiping) - only active jobs
            queryset = queryset.filter(status='active')
            
            # Exclude jobs from user's own company if they're a company user
            if request.user.role == 'company':
                user_company = get_user_company_profile(request.user)
                if user_company:
                    queryset = queryset.exclude(company=user_company)

        # Apply filters
        queryset = self._apply_filters(queryset, request)
        
        # Pagination and serialization
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    def _apply_filters(self, queryset, request):
        """Apply filtering based on query parameters"""
        # Location filter
        location = request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        # Job type filter
        job_type = request.query_params.get('job_type')
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        
        # Work mode filter
        work_mode = request.query_params.get('work_mode')
        if work_mode:
            queryset = queryset.filter(work_mode=work_mode)
        
        # Experience level filter
        experience = request.query_params.get('experience')
        if experience:
            queryset = queryset.filter(experience_required=experience)
        
        # Technology filter
        tech = request.query_params.get('tech')
        if tech:
            queryset = queryset.filter(tech_stack__contains=[tech])
        
        # Salary range filter
        min_salary = request.query_params.get('min_salary')
        if min_salary:
            try:
                queryset = queryset.filter(salary_min__gte=int(min_salary))
            except ValueError:
                pass
        
        max_salary = request.query_params.get('max_salary')
        if max_salary:
            try:
                queryset = queryset.filter(salary_max__lte=int(max_salary))
            except ValueError:
                pass
        
        # Company filter
        company = request.query_params.get('company')
        if company:
            queryset = queryset.filter(company__name__icontains=company)
        
        # Search filter (title, description, tech_stack)
        search = request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(tech_stack__contains=[search])
            )
        
        return queryset

    def retrieve(self, request, pk=None):
        """Get specific job posting"""
        job = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(job)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        job = get_object_or_404(self.get_queryset(), pk=kwargs.get('pk'))
        
        # Check permissions
        can_manage, error_msg = can_user_manage_jobs(request.user, job.company)
        if not can_manage:
            return Response({
                'message': error_msg
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = JobPostingSerializer(job, data=request.data, partial=partial, context={'request': request})
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Job updated successfully',
                'job': serializer.data
            })
        
        return Response({
            'message': 'Job update failed',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


    def destroy(self, request, pk=None):
        """Delete job posting (soft delete by changing status)"""
        job = get_object_or_404(self.get_queryset(), pk=pk)
        
        # Check permissions
        can_manage, error_msg = can_user_manage_jobs(request.user, job.company)
        if not can_manage:
            return Response({
                'message': error_msg
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Soft delete by changing status
        job.status = 'closed'
        job.save(update_fields=['status'])
        
        return Response({
            'message': 'Job posting closed successfully'
        })

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a job posting"""
        job = get_object_or_404(self.get_queryset(), pk=pk)
        
        # Check permissions
        can_manage, error_msg = can_user_manage_jobs(request.user, job.company)
        if not can_manage:
            return Response({
                'message': error_msg
            }, status=status.HTTP_403_FORBIDDEN)
        
        job.close_job()
        
        return Response({
            'message': 'Job posting closed successfully',
            'job': JobPostingSerializer(job, context={'request': request}).data
        })

    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get job statistics for company"""
        company = get_user_company_profile(request.user)
        if not company:
            return Response({
                'message': 'Company profile required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        jobs = JobPosting.objects.filter(company=company)
        
        stats = {
            'total_jobs': jobs.count(),
            'active_jobs': jobs.filter(status='active').count(),
            'draft_jobs': jobs.filter(status='draft').count(),
            'closed_jobs': jobs.filter(status='closed').count(),
            'total_applications': sum(job.swipes.count() for job in jobs if hasattr(job, 'swipes')),
            'avg_match_score': 0  # This would need actual match data
        }
        
        serializer = JobStatisticsSerializer(stats)
        return Response(serializer.data)


class WishlistViewSet(viewsets.ModelViewSet):
    """ViewSet for wishlist management"""
    
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Get user's wishlist items"""
        return Wishlist.objects.filter(user=self.request.user).select_related('job_post', 'job_post__company')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        if self.action == 'create':
            return WishlistCreateSerializer
        return WishlistSerializer

    def create(self, request):
        """Add job to wishlist"""
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            wishlist_item = serializer.save()
            
            return Response({
                'message': 'Job added to wishlist successfully',
                'wishlist_item': WishlistSerializer(wishlist_item).data
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'message': 'Failed to add job to wishlist',
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    def list(self, request):
        """Get user's wishlist"""
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'count': queryset.count(),
            'results': serializer.data
        })

    def destroy(self, request, pk=None):
        """Remove job from wishlist"""
        wishlist_item = get_object_or_404(self.get_queryset(), pk=pk)
        wishlist_item.delete()
        
        return Response({
            'message': 'Job removed from wishlist successfully'
        })

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """Clear entire wishlist"""
        deleted_count = self.get_queryset().delete()[0]
        
        return Response({
            'message': f'Cleared {deleted_count} items from wishlist'
        })