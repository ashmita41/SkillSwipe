from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Q, Count, Exists, OuterRef
from django.utils import timezone
from datetime import timedelta

from .models import SwipeActions, Match
from .serializers import (
    SwipeCreateSerializer, SwipeActionSerializer, 
    MatchSerializer, DashboardStatsSerializer
)
from jobs.models import JobPosting
from jobs.serializers import JobPostingPublicSerializer
from profiles.models import DeveloperProfile, CompanyProfile
from profiles.serializers import DeveloperProfilePublicSerializer, CompanyProfilePublicSerializer

User = get_user_model()


class SwipeAPIView(APIView):
    """Handle swipe actions with automatic match detection"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Create a swipe action"""
        serializer = SwipeCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            result = serializer.save()
            swipe = result['swipe']
            match = result['match']
            match_created = result['match_created']
            
            response_data = {
                'success': True,
                'swipe_id': str(swipe.id),
                'swipe_type': swipe.swipe_type,
                'timestamp': swipe.timestamp,
                'match_created': match_created
            }
            
            if match_created and match:
                response_data['match'] = {
                    'match_id': str(match.id),
                    'matched_with': match.user_2.username if request.user == match.user_1 else match.user_1.username,
                    'job_title': match.job_post.title if match.job_post else None
                }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DiscoverAPIView(APIView):
    """Get filtered cards for swiping"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get cards to swipe on based on user role"""
        user = request.user
        
        # Get already swiped items to exclude
        swiped_users = SwipeActions.objects.filter(
            swiper=user, swipe_type='profile'
        ).values_list('swiped_on_id', flat=True)
        
        swiped_jobs = SwipeActions.objects.filter(
            swiper=user, swipe_type='job'
        ).values_list('job_post_id', flat=True)
        
        if user.role == 'developer':
            return self._get_jobs_for_developer(request, swiped_jobs)
        else:  # company
            return self._get_developers_for_company(request, swiped_users)
    
    def _get_jobs_for_developer(self, request, swiped_jobs):
        """Get job cards for developer to swipe on"""
        # Exclude already swiped jobs
        queryset = JobPosting.objects.filter(
            status='active'
        ).exclude(
            id__in=swiped_jobs
        ).select_related('company').order_by('-created_at')
        
        # Apply filters
        location = request.query_params.get('location')
        job_type = request.query_params.get('job_type')
        work_mode = request.query_params.get('work_mode')
        experience = request.query_params.get('experience')
        tech_stack = request.query_params.get('tech_stack')
        
        if location:
            queryset = queryset.filter(location__icontains=location)
        if job_type:
            queryset = queryset.filter(job_type=job_type)
        if work_mode:
            queryset = queryset.filter(work_mode=work_mode)
        if experience:
            queryset = queryset.filter(experience_required=experience)
        if tech_stack:
            queryset = queryset.filter(tech_stack__icontains=tech_stack)
        
        # Limit results for better performance
        queryset = queryset[:20]
        
        serializer = JobPostingPublicSerializer(
            queryset, many=True, context={'request': request}
        )
        
        return Response({
            'type': 'jobs',
            'count': len(serializer.data),
            'results': serializer.data
        })
    
    def _get_developers_for_company(self, request, swiped_users):
        """Get developer cards for company to swipe on"""
        # Get developers excluding already swiped ones
        queryset = User.objects.filter(
            role='developer',
            is_active=True
        ).exclude(
            id__in=swiped_users
        ).exclude(
            id=request.user.id  # Exclude self
        ).select_related('developer_profile').order_by('-date_joined')
        
        # Apply filters
        location = request.query_params.get('location')
        experience = request.query_params.get('experience')
        tech_stack = request.query_params.get('tech_stack')
        
        if location:
            queryset = queryset.filter(
                Q(developer_profile__current_location__icontains=location) |
                Q(developer_profile__top_two_cities__icontains=location)
            )
        
        if experience:
            exp_mapping = {'entry': (0, 2), 'mid': (2, 5), 'senior': (5, 10), 'lead': (10, 50)}
            min_exp, max_exp = exp_mapping.get(experience, (0, 50))
            queryset = queryset.filter(
                developer_profile__experience_years__gte=min_exp,
                developer_profile__experience_years__lte=max_exp
            )
        
        if tech_stack:
            queryset = queryset.filter(
                Q(developer_profile__top_languages__icontains=tech_stack) |
                Q(developer_profile__tools__icontains=tech_stack)
            )
        
        # Limit results
        queryset = queryset[:20]
        
        # Get developer profiles
        developer_profiles = []
        for user in queryset:
            if hasattr(user, 'developer_profile'):
                developer_profiles.append(user.developer_profile)
        
        serializer = DeveloperProfilePublicSerializer(
            developer_profiles, many=True, context={'request': request}
        )
        
        return Response({
            'type': 'developers',
            'count': len(serializer.data),
            'results': serializer.data
        })


class DashboardAPIView(APIView):
    """Dashboard with three tabs: For Me, Showed Interest, Matches"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Get dashboard data with tabs"""
        user = request.user
        tab = request.query_params.get('tab', 'for_me')
        
        if tab == 'for_me':
            return self._get_for_me_tab(request)
        elif tab == 'showed_interest':
            return self._get_showed_interest_tab(request)
        elif tab == 'matches':
            return self._get_matches_tab(request)
        elif tab == 'stats':
            return self._get_dashboard_stats(request)
        else:
            return Response(
                {'error': 'Invalid tab. Choose: for_me, showed_interest, matches, stats'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _get_for_me_tab(self, request):
        """Get swipes received by current user"""
        user = request.user
        
        # Get swipes received by this user
        swipes_received = SwipeActions.objects.filter(
            swiped_on=user
        ).select_related('swiper', 'job_post__company').order_by('-timestamp')
        
        serializer = SwipeActionSerializer(swipes_received, many=True)
        
        return Response({
            'tab': 'for_me',
            'title': 'People/Companies Interested in You',
            'count': len(serializer.data),
            'results': serializer.data
        })
    
    def _get_showed_interest_tab(self, request):
        """Get swipes made by current user"""
        user = request.user
        
        # Get swipes made by this user
        swipes_made = SwipeActions.objects.filter(
            swiper=user
        ).select_related('swiped_on', 'job_post__company').order_by('-timestamp')
        
        serializer = SwipeActionSerializer(swipes_made, many=True)
        
        return Response({
            'tab': 'showed_interest',
            'title': 'Your Interest History',
            'count': len(serializer.data),
            'results': serializer.data
        })
    
    def _get_matches_tab(self, request):
        """Get matches for current user"""
        user = request.user
        
        # Get matches for this user
        matches = Match.objects.filter(
            Q(user_1=user) | Q(user_2=user),
            status='active'
        ).select_related('user_1', 'user_2', 'job_post__company').order_by('-matched_on')
        
        serializer = MatchSerializer(matches, many=True)
        
        return Response({
            'tab': 'matches',
            'title': 'Your Matches',
            'count': len(serializer.data),
            'results': serializer.data
        })
    

    def _get_dashboard_stats(self, request):
        """Get dashboard statistics"""
        user = request.user
        
        # Calculate stats
        total_swipes_made = SwipeActions.objects.filter(swiper=user).count()
        total_swipes_received = SwipeActions.objects.filter(swiped_on=user).count()
        total_matches = Match.objects.filter(Q(user_1=user) | Q(user_2=user)).count()
        active_matches = Match.objects.filter(
            Q(user_1=user) | Q(user_2=user), status='active'
        ).count()
        
        # Profile completion 
        profile_completion = 0
        try:
            if user.role == 'developer' and hasattr(user, 'developer_profile'):
                profile = user.developer_profile
                # Use getattr with default values to avoid AttributeError
                fields = [
                    getattr(profile, 'bio', None),
                    getattr(profile, 'current_location', None),
                    getattr(profile, 'top_languages', None),
                    getattr(profile, 'github_url', None),
                    getattr(profile, 'linkedin_url', None)
                ]
                completed_fields = sum(1 for field in fields if field)
                profile_completion = (completed_fields / len(fields)) * 100
            
            elif user.role == 'company' and hasattr(user, 'company_profile'):
                profile = user.company_profile
                # Use getattr with default values to avoid AttributeError
                fields = [
                    getattr(profile, 'about', None),
                    getattr(profile, 'location', None),
                    getattr(profile, 'website', None),
                    getattr(profile, 'headquarters', None),
                    getattr(profile, 'contact_email', None)
                ]
                completed_fields = sum(1 for field in fields if field)
                profile_completion = (completed_fields / len(fields)) * 100
        
        except AttributeError as e:
            # If there's any AttributeError, set profile completion to 0
            profile_completion = 0
        
        # Recent activity (last 7 days)
        try:
            week_ago = timezone.now() - timedelta(days=7)
            recent_swipes = SwipeActions.objects.filter(
                Q(swiper=user) | Q(swiped_on=user),
                timestamp__gte=week_ago
            ).count()
            
            recent_matches = Match.objects.filter(
                Q(user_1=user) | Q(user_2=user),
                matched_on__gte=week_ago
            ).count()
            
            recent_activity = [
                f"{recent_swipes} swipes this week",
                f"{recent_matches} new matches this week"
            ]
        except Exception as e:
            recent_activity = ["No recent activity data available"]
        
        stats_data = {
            'total_swipes_made': total_swipes_made,
            'total_swipes_received': total_swipes_received,
            'total_matches': total_matches,
            'active_matches': active_matches,
            'profile_completion': profile_completion,
            'recent_activity': recent_activity
        }
        
        serializer = DashboardStatsSerializer(stats_data)
        
        return Response({
            'tab': 'stats',
            'title': 'Your Statistics',
            'data': serializer.data
        })