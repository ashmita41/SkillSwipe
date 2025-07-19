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
        
        print(f"🔍 Dashboard API called - User: {user.username}, Role: {user.role}, Tab: {tab}")
        
        if tab == 'for_me':
            return self._get_for_me_tab(request)
        elif tab == 'showed_interest':
            return self._get_showed_interest_tab(request)
        elif tab == 'my_swipes':
            return self._get_my_swipes_tab(request)
        elif tab == 'matches':
            return self._get_matches_tab(request)
        elif tab == 'stats':
            return self._get_dashboard_stats(request)
        else:
            return Response(
                {'error': 'Invalid tab. Choose: for_me, showed_interest, my_swipes, matches, stats'},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    def _get_for_me_tab(self, request):
        """Get personalized recommendations (merged with discover logic)"""
        user = request.user
        
        print(f"🔍 FOR_ME TAB - User: {user.username}, Role: {user.role}")
        
        if user.role == 'developer':
            # DEVELOPER: Show JOBS in For Me tab
            # Get already swiped jobs to exclude (from My Swipes)
            swiped_jobs = SwipeActions.objects.filter(
                swiper=user, swipe_type='job'
            ).values_list('job_post_id', flat=True)
            
            # Get wishlisted jobs to exclude from feed
            from jobs.models import Wishlist
            wishlisted_jobs = Wishlist.objects.filter(
                user=user, job_post__isnull=False
            ).values_list('job_post_id', flat=True)
            
            # Get jobs excluding already swiped ones and wishlisted ones
            jobs = JobPosting.objects.filter(
                status='active'
            ).exclude(
                id__in=swiped_jobs  # Exclude jobs already swiped right on
            ).exclude(
                id__in=wishlisted_jobs  # Exclude wishlisted jobs
            ).select_related('company').order_by('-created_at')[:20]
            
            from jobs.serializers import JobPostingPublicSerializer
            serializer = JobPostingPublicSerializer(jobs, many=True, context={'request': request})
            
            print(f"🔍 FOR_ME (Developer) - Found {len(jobs)} jobs")
            print(f"🔍 FOR_ME (Developer) - Excluded swiped jobs: {len(swiped_jobs)}")
            print(f"🔍 FOR_ME (Developer) - Excluded wishlisted jobs: {len(wishlisted_jobs)}")
            
            return Response({
                'tab': 'for_me',
                'title': 'Discover New Job Opportunities',
                'type': 'jobs',
                'count': len(serializer.data),
                'results': serializer.data
            })
        else:
            # COMPANY: Show DEVELOPERS in For Me tab
            # Get already swiped developers to exclude (from My Swipes)
            swiped_developers = SwipeActions.objects.filter(
                swiper=user, swipe_type='profile'
            ).values_list('swiped_on_id', flat=True)
            
            # Get bookmarked developers to exclude from feed
            from jobs.models import Wishlist
            bookmarked_developers = Wishlist.objects.filter(
                user=user, wishlisted_user__isnull=False
            ).values_list('wishlisted_user_id', flat=True)
            
            # Get developers excluding already swiped ones and bookmarked ones
            developers = User.objects.filter(
                role='developer',
                is_active=True
            ).exclude(
                id__in=swiped_developers  # Exclude developers already swiped right on
            ).exclude(
                id__in=bookmarked_developers  # Exclude bookmarked developers
            ).exclude(
                id=user.id
            ).select_related('developer_profile').order_by('-date_joined')[:20]
            
            # Get developer profiles
            developer_profiles = []
            for dev_user in developers:
                if hasattr(dev_user, 'developer_profile'):
                    developer_profiles.append(dev_user.developer_profile)
            
            from profiles.serializers import DeveloperProfilePublicSerializer
            serializer = DeveloperProfilePublicSerializer(
                developer_profiles, many=True, context={'request': request}
            )
            
            print(f"🔍 FOR_ME (Company) - Found {len(developers)} developers")
            print(f"🔍 FOR_ME (Company) - Excluded swiped developers: {len(swiped_developers)}")
            print(f"🔍 FOR_ME (Company) - Excluded bookmarked developers: {len(bookmarked_developers)}")
            
            return Response({
                'tab': 'for_me',
                'title': 'Discover New Developer Talent',
                'type': 'developers',
                'count': len(serializer.data),
                'results': serializer.data
            })
    
    def _get_showed_interest_tab(self, request):
        """Get users who showed interest in current user (swiped right on them)"""
        user = request.user
        
        print(f"🔍 SHOWED_INTEREST TAB - User: {user.username}, Role: {user.role}")
        
        if user.role == 'developer':
            # DEVELOPER: Show COMPANIES who swiped right on this developer's profile
            company_swipes = SwipeActions.objects.filter(
                swiped_on=user, 
                swipe_type='profile'
            ).select_related('swiper').order_by('-timestamp')
            
            # Get companies that this developer has already swiped back on (to exclude)
            already_swiped_companies = SwipeActions.objects.filter(
                swiper=user, swipe_type='profile'
            ).values_list('swiped_on_id', flat=True)
            
            print(f"🔍 SHOWED_INTEREST (Developer) - Company swipes received: {company_swipes.count()}")
            print(f"🔍 SHOWED_INTEREST (Developer) - Already swiped companies: {len(already_swiped_companies)}")
            
            # Get company profiles (excluding already swiped)
            company_data = []
            for swipe in company_swipes:
                company_user = swipe.swiper
                
                # Skip if developer has already swiped back on this company
                if company_user.id in already_swiped_companies:
                    continue
                
                # Get company profile for this user
                if company_user.company_memberships.exists():
                    company_profile = company_user.company_memberships.first().company
                    
                    from profiles.serializers import CompanyProfilePublicSerializer
                    profile_data = CompanyProfilePublicSerializer(company_profile, context={'request': request}).data
                    # Add the specific user who swiped for frontend use
                    profile_data['user_id'] = str(company_user.id)
                    profile_data['username'] = company_user.username
                    profile_data['swipe_timestamp'] = swipe.timestamp.isoformat()
                    company_data.append(profile_data)
            
            print(f"🔍 SHOWED_INTEREST (Developer) - Final company data: {len(company_data)}")
            
            return Response({
                'tab': 'showed_interest',
                'title': 'Companies Who Liked You',
                'type': 'companies',
                'count': len(company_data),
                'results': company_data
            })
        else:
            # COMPANY: Show DEVELOPERS who swiped right on this company's jobs
            job_swipes = SwipeActions.objects.filter(
                job_post__created_by=user,  # Jobs created by this company user
                swipe_type='job'
            ).select_related('swiper').order_by('-timestamp')
            
            # Get unique developer IDs who liked this company's jobs
            developer_ids = set(job_swipes.values_list('swiper_id', flat=True))
            
            # Get developers that this company has already swiped back on (to exclude)
            already_swiped_developers = SwipeActions.objects.filter(
                swiper=user, swipe_type='profile'
            ).values_list('swiped_on_id', flat=True)
            
            print(f"🔍 SHOWED_INTEREST (Company) - Job swipes received: {job_swipes.count()}")
            print(f"🔍 SHOWED_INTEREST (Company) - Unique developers: {len(developer_ids)}")
            print(f"🔍 SHOWED_INTEREST (Company) - Already swiped developers: {len(already_swiped_developers)}")
            
            # Exclude developers already swiped back on
            available_developer_ids = [
                dev_id for dev_id in developer_ids 
                if dev_id not in already_swiped_developers
            ]
            
            developers = User.objects.filter(
                id__in=available_developer_ids, 
                role='developer',
                is_active=True
            ).select_related('developer_profile')
            
            # Get developer profiles
            developer_profiles = []
            for dev_user in developers:
                if hasattr(dev_user, 'developer_profile'):
                    developer_profiles.append(dev_user.developer_profile)
            
            from profiles.serializers import DeveloperProfilePublicSerializer
            serializer = DeveloperProfilePublicSerializer(
                developer_profiles, many=True, context={'request': request}
            )
            
            print(f"🔍 SHOWED_INTEREST (Company) - Final developer profiles: {len(developer_profiles)}")
            
            return Response({
                'tab': 'showed_interest',
                'title': 'Developers Who Liked Your Jobs',
                'type': 'developers',
                'count': len(serializer.data),
                'results': serializer.data
            })
    
    def _get_my_swipes_tab(self, request):
        """Get users that current user has swiped right on"""
        user = request.user
        
        print(f"🔍 MY_SWIPES TAB - User: {user.username}, Role: {user.role}")
        
        if user.role == 'developer':
            # DEVELOPER: Show JOBS that this developer swiped right on
            job_swipes = SwipeActions.objects.filter(
                swiper=user,
                swipe_type='job'
            ).select_related('job_post').order_by('-timestamp')
            
            print(f"🔍 MY_SWIPES (Developer) - Job swipes made: {job_swipes.count()}")
            
            jobs = []
            for swipe in job_swipes:
                if swipe.job_post and swipe.job_post.status == 'active':
                    jobs.append(swipe.job_post)
            
            from jobs.serializers import JobPostingPublicSerializer
            serializer = JobPostingPublicSerializer(
                jobs, many=True, context={'request': request}
            )
            
            print(f"🔍 MY_SWIPES (Developer) - Active jobs: {len(jobs)}")
            
            return Response({
                'tab': 'my_swipes',
                'title': 'Jobs You Liked',
                'type': 'jobs',
                'count': len(serializer.data),
                'results': serializer.data
            })
        else:
            # COMPANY: Show DEVELOPERS that this company swiped right on
            profile_swipes = SwipeActions.objects.filter(
                swiper=user,
                swipe_type='profile'
            ).select_related('swiped_on').order_by('-timestamp')
            
            print(f"🔍 MY_SWIPES (Company) - Profile swipes made: {profile_swipes.count()}")
            
            developer_profiles = []
            for swipe in profile_swipes:
                if (hasattr(swipe.swiped_on, 'developer_profile') and 
                    swipe.swiped_on.is_active):
                    developer_profiles.append(swipe.swiped_on.developer_profile)
            
            from profiles.serializers import DeveloperProfilePublicSerializer
            serializer = DeveloperProfilePublicSerializer(
                developer_profiles, many=True, context={'request': request}
            )
            
            print(f"🔍 MY_SWIPES (Company) - Active developers: {len(developer_profiles)}")
            
            return Response({
                'tab': 'my_swipes',
                'title': 'Developers You Liked',
                'type': 'developers',
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
        
        print(f"DEBUG MATCHES: Found {matches.count()} matches for {user.username}")
        
        # Transform matches into displayable objects based on user role
        match_data = []
        
        for match in matches:
            # Determine the other user in the match
            other_user = match.user_2 if match.user_1 == user else match.user_1
            
            print(f"DEBUG MATCHES: Processing match {match.id} - {user.username} <-> {other_user.username} via job {match.job_post.title if match.job_post else 'None'}")
            
            match_info = {
                'match_id': str(match.id),
                'matched_on': match.matched_on,
                'job_context': None,
                'matched_user': None
            }
            
            # Add job context if available
            if match.job_post:
                from jobs.serializers import JobPostingPublicSerializer
                job_serializer = JobPostingPublicSerializer(match.job_post, context={'request': request})
                match_info['job_context'] = job_serializer.data
            
            # Add the matched user's profile
            if other_user.role == 'developer' and hasattr(other_user, 'developer_profile'):
                from profiles.serializers import DeveloperProfilePublicSerializer
                profile_serializer = DeveloperProfilePublicSerializer(other_user.developer_profile, context={'request': request})
                match_info['matched_user'] = profile_serializer.data
                match_info['matched_user']['role'] = 'developer'
            elif other_user.role == 'company' and other_user.company_memberships.exists():
                from profiles.serializers import CompanyProfilePublicSerializer
                company_profile = other_user.company_memberships.first().company
                profile_serializer = CompanyProfilePublicSerializer(company_profile, context={'request': request})
                match_info['matched_user'] = profile_serializer.data
                match_info['matched_user']['role'] = 'company'
            
            if match_info['matched_user']:
                match_data.append(match_info)
                print(f"DEBUG MATCHES: Added match data for {other_user.username}")
            else:
                print(f"DEBUG MATCHES: Skipped match - no profile for {other_user.username}")
        
        print(f"DEBUG MATCHES: Returning {len(match_data)} displayable matches")
        
        return Response({
            'tab': 'matches',
            'title': 'Your Matches',
            'type': 'matches',
            'count': len(match_data),
            'results': match_data
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