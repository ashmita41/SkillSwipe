from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.utils import timezone
from profiles.utils import get_user_profile_status  # Import shared logic

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
    """Check if user has completed profile creation - REFACTORED"""
    user = request.user
    
    # Use shared utility function (no duplication)
    profile_status_data = get_user_profile_status(user)
    
    return Response(profile_status_data)


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