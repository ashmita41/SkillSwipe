from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Custom login view that accepts email"""
    email = request.data.get('email')
    password = request.data.get('password')
    
    if not email or not password:
        return Response({
            'error': 'Email and password are required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        if user.check_password(password):
            # Update last ping on login
            user.update_last_ping()
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': str(user.id),
                    'username': user.username,
                    'email': user.email,
                    'role': user.role,
                    'status': user.status
                }
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile_status(request):
    """Check if user has completed profile creation"""
    user = request.user
    
    # Check profile completion based on role
    if user.role == 'developer':
        has_profile = hasattr(user, 'developer_profile')
        if has_profile:
            profile = user.developer_profile
            # Calculate completion percentage
            required_fields = [
                profile.name, profile.bio, profile.current_location,
                profile.experience_years, profile.top_languages
            ]
            completed_fields = sum(1 for field in required_fields if field)
            completion_percentage = int((completed_fields / len(required_fields)) * 100)
            
            next_step = None
            if completion_percentage < 100:
                if not profile.name:
                    next_step = "add_name"
                elif not profile.bio:
                    next_step = "add_bio"
                elif not profile.current_location:
                    next_step = "add_location"
                elif not profile.experience_years:
                    next_step = "add_experience"
                elif not profile.top_languages:
                    next_step = "add_skills"
        else:
            completion_percentage = 0
            next_step = "create_developer_profile"
            
    elif user.role == 'company':
        # Check if user is associated with any company
        has_profile = user.company_memberships.exists()
        if has_profile:
            company_membership = user.company_memberships.first()
            company = company_membership.company
            # Calculate completion for company
            required_fields = [company.name, company.about, company.location]
            completed_fields = sum(1 for field in required_fields if field)
            completion_percentage = int((completed_fields / len(required_fields)) * 100)
            
            next_step = None
            if completion_percentage < 100:
                if not company.name:
                    next_step = "add_company_name"
                elif not company.about:
                    next_step = "add_company_about"
                elif not company.location:
                    next_step = "add_company_location"
        else:
            completion_percentage = 0
            next_step = "create_company_profile"
    
    return Response({
        'has_profile': has_profile,
        'profile_completion': completion_percentage,
        'next_required_step': next_step,
        'user_role': user.role,
        'profile_mandatory': True  # Always mandatory 
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_activity(request):
    """Update user's last activity (ping)"""
    user = request.user
    user.update_last_ping()
    
    return Response({
        'message': 'Activity updated successfully',
        'last_ping': user.last_ping,
        'status': user.status
    })


# Update the logout_view function:

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout user (blacklist refresh token)"""
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({
                'error': 'Refresh token is required'
            }, status=status.HTTP_400_BAD_REQUEST)
            
        from rest_framework_simplejwt.tokens import RefreshToken
        token = RefreshToken(refresh_token)
        token.blacklist()
        
        return Response({
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({
            'message': 'Invalid or expired refresh token',
            'error': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)