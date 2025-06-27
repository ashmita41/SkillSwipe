"""
Shared utility functions for job management.
Prevents code duplication and centralizes business logic.
"""

def get_user_company_profile(user):
    """
    Get user's company profile if they have one.
    Used across job APIs for company validation.
    """
    if user.role != 'company':
        return None
    
    try:
        company_membership = user.company_memberships.first()
        return company_membership.company if company_membership else None
    except:
        return None


def can_user_manage_jobs(user, company=None):
    """
    Check if user can create/manage jobs for a company.
    """
    if user.role != 'company':
        return False, "Only company users can manage jobs"
    
    if not company:
        company = get_user_company_profile(user)
    
    if not company:
        return False, "User must have a company profile to create jobs"
    
    # Check if user has permission to manage jobs for this company
    try:
        membership = user.company_memberships.get(company=company)
        if membership.role in ['admin', 'hr']:
            return True, ""
        else:
            return False, "Only admin or HR can manage jobs"
    except:
        return False, "User is not associated with this company"


def calculate_job_match_score(job, developer_profile):
    """
    Calculate basic job-developer match score.
    Used for filtering and ranking jobs.
    """
    if not developer_profile:
        return 0
    
    score = 0
    
    # Tech stack match (40% weight)
    if job.tech_stack and developer_profile.top_languages:
        common_tech = set(job.tech_stack) & set(developer_profile.top_languages + developer_profile.tools)
        tech_score = (len(common_tech) / len(job.tech_stack)) * 40
        score += tech_score
    
    # Experience level match (30% weight)
    if job.experience_required and developer_profile.experience_years:
        exp_mapping = {'entry': (0, 2), 'mid': (2, 5), 'senior': (5, 10), 'lead': (10, 50)}
        req_min, req_max = exp_mapping.get(job.experience_required, (0, 50))
        
        if req_min <= developer_profile.experience_years <= req_max:
            score += 30
        elif abs(developer_profile.experience_years - req_min) <= 1:
            score += 15  # Close match
    
    # Location match (20% weight)
    if job.location and developer_profile.current_location:
        if job.location.lower() in developer_profile.current_location.lower():
            score += 20
        elif developer_profile.willing_to_relocate and developer_profile.top_two_cities:
            if any(city.lower() in job.location.lower() for city in developer_profile.top_two_cities):
                score += 10
    
    # Salary match (10% weight)
    if job.salary_min and developer_profile.salary_expectation_min:
        if job.salary_min >= developer_profile.salary_expectation_min:
            score += 10
    
    return min(score, 100)  # Cap at 100%