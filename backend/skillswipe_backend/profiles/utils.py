"""
Shared utility functions for profile management.
Prevents code duplication across authentication and profile apps.
"""

def calculate_developer_profile_completion(profile):
    """
    Calculate developer profile completion percentage.
    Used by both authentication and profile APIs.
    """
    if not profile:
        return 0
    
    required_fields = [
        profile.name,
        profile.bio,
        profile.current_location,
        profile.experience_years,
        profile.top_languages
    ]
    
    completed_fields = sum(1 for field in required_fields if field)
    return int((completed_fields / len(required_fields)) * 100)


def calculate_company_profile_completion(company):
    """
    Calculate company profile completion percentage.
    Used by both authentication and profile APIs.
    """
    if not company:
        return 0
    
    required_fields = [
        company.name,
        company.about,
        company.location
    ]
    
    completed_fields = sum(1 for field in required_fields if field)
    return int((completed_fields / len(required_fields)) * 100)


def get_user_profile_status(user):
    """
    Get comprehensive profile status for any user.
    Used by authentication APIs.
    """
    if user.role == 'developer':
        # Refresh user from database to get latest related objects
        user.refresh_from_db()
        
        # Try multiple ways to check for profile existence
        has_profile = False
        profile = None
        
        try:
            # First try hasattr (fastest)
            if hasattr(user, 'developer_profile'):
                profile = user.developer_profile
                has_profile = True
            else:
                # If hasattr fails, try direct database query
                from .models import DeveloperProfile
                profile = DeveloperProfile.objects.filter(user=user).first()
                has_profile = profile is not None
        except Exception as e:
            print(f"DEBUG: Error checking developer profile: {e}")
            has_profile = False
            
        if has_profile and profile:
            completion_percentage = calculate_developer_profile_completion(profile)
            
            # Determine next step
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
        # Refresh user from database to get latest related objects
        user.refresh_from_db()
        
        has_profile = user.company_memberships.exists()
        if has_profile:
            company = user.company_memberships.first().company
            completion_percentage = calculate_company_profile_completion(company)
            
            # Determine next step
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
    
    print(f"DEBUG: Profile status for {user.username} ({user.role}): has_profile={has_profile}, completion={completion_percentage if 'completion_percentage' in locals() else 0}")
    
    return {
        'has_profile': has_profile,
        'profile_completion': completion_percentage if 'completion_percentage' in locals() else 0,
        'next_required_step': next_step if 'next_step' in locals() else 'unknown',
        'user_role': user.role,
        'profile_mandatory': True
    }


def check_profile_exists(user):
    """
    Simple check if user has a profile based on role.
    Used across multiple APIs.
    """
    if user.role == 'developer':
        return hasattr(user, 'developer_profile')
    elif user.role == 'company':
        return user.company_memberships.exists()
    return False