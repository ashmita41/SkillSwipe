from rest_framework import serializers
from djoser.serializers import UserCreateSerializer, UserSerializer
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomUserCreateSerializer(UserCreateSerializer):
    """Custom user registration serializer"""
    
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=True)
    
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'password', 'role')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class CustomUserSerializer(UserSerializer):
    """Custom user details serializer"""
    
    class Meta(UserSerializer.Meta):
        model = User
        fields = ('id', 'username', 'email', 'role', 'status', 'date_joined')
        read_only_fields = ('id', 'role', 'status', 'date_joined')