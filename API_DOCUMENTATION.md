# SkillSwipe API Documentation

## Overview

SkillSwipe is a modern hiring platform that connects developers and companies through a swipe-based matching system. This documentation covers all available REST API endpoints.

**Base URL:** `http://127.0.0.1:8000/api`  
**Authentication:** JWT Bearer Token  
**Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Profile Management](#profile-management)
3. [Job Management](#job-management)
4. [Swiping & Matching](#swiping--matching)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)

---

## Authentication

### Register User
**POST** `/auth/users/`

Create a new user account with role selection.

**Request Body:**
```json
{
    "username": "string",
    "email": "string (email format)",
    "password": "string (min 8 chars)",
    "role": "developer | company"
}
```

**Response (201):**
```json
{
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "developer | company"
}
```

**Example:**
```bash
curl -X POST http://127.0.0.1:8000/api/auth/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com", 
    "password": "securepass123",
    "role": "developer"
  }'
```

---

### Login
**POST** `/auth/login/`

Authenticate user and receive JWT tokens.

**Request Body:**
```json
{
    "email": "string",
    "password": "string"
}
```

**Response (200):**
```json
{
    "access": "jwt_access_token",
    "refresh": "jwt_refresh_token",
    "user": {
        "id": "uuid",
        "username": "string",
        "email": "string",
        "role": "developer | company"
    }
}
```

---

### Profile Status
**GET** `/auth/profile-status/`

Check user's profile completion status.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "user_id": "uuid",
    "role": "developer | company",
    "profile_exists": true,
    "profile_completion": 85.5,
    "last_ping": "2024-01-15T10:30:00Z",
    "status": "active"
}
```

---

### Update Activity
**POST** `/auth/ping/`

Update user's last activity timestamp.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "message": "Activity updated successfully",
    "last_ping": "2024-01-15T10:30:00Z"
}
```

---

### Refresh Token
**POST** `/auth/jwt/refresh/`

Refresh access token using refresh token.

**Request Body:**
```json
{
    "refresh": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
    "access": "new_jwt_access_token"
}
```

---

### Logout
**POST** `/auth/logout/`

Invalidate refresh token.

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
    "refresh": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
    "message": "Successfully logged out"
}
```

---

## Profile Management

### Create Developer Profile
**POST** `/profiles/developer/`

Create developer profile (required after registration).

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
    "bio": "string",
    "current_location": "string",
    "experience_years": "integer",
    "top_languages": ["Python", "JavaScript"],
    "tools": ["Docker", "AWS"],
    "github_url": "string (url)",
    "linkedin_url": "string (url)",
    "portfolio_url": "string (url)",
    "salary_expectation_min": "integer",
    "salary_expectation_max": "integer",
    "willing_to_relocate": "boolean",
    "top_two_cities": ["San Francisco", "New York"]
}
```

**Response (201):**
```json
{
    "id": "uuid",
    "user_username": "string",
    "bio": "string",
    "current_location": "string",
    "experience_years": 5,
    "top_languages": ["Python", "JavaScript"],
    "github_url": "string",
    "profile_completion": 90.0,
    "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Get Developer Profile
**GET** `/profiles/developer/`

Retrieve current user's developer profile.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):** Same as create response

---

### Update Developer Profile
**PUT/PATCH** `/profiles/developer/`

Update developer profile (PUT for full update, PATCH for partial).

**Headers:** `Authorization: Bearer {access_token}`

**Request/Response:** Same as create developer profile

---

### Create Company Profile
**POST** `/profiles/company/`

Create company profile (required after registration).

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
    "name": "string",
    "about": "string",
    "industry": "string",
    "company_size": "1-10 | 11-50 | 51-200 | 201-500 | 500+",
    "location": "string",
    "headquarters": "string",
    "website": "string (url)",
    "contact_email": "string (email)"
}
```

**Response (201):**
```json
{
    "id": "uuid",
    "user_username": "string",
    "name": "string",
    "about": "string",
    "industry": "string",
    "company_size": "11-50",
    "location": "string",
    "website": "string",
    "profile_completion": 95.0,
    "total_jobs": 3,
    "created_at": "2024-01-15T10:30:00Z"
}
```

---

### Get Company Profile
**GET** `/profiles/company/`

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):** Same as create response

---

### Update Company Profile
**PUT/PATCH** `/profiles/company/`

**Headers:** `Authorization: Bearer {access_token}`

**Request/Response:** Same as create company profile

---

### List Company Users
**GET** `/profiles/company-users/`

Get all users associated with the company.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "count": 2,
    "results": [
        {
            "id": "uuid",
            "user_username": "string",
            "role": "admin | member",
            "permissions": ["can_create_jobs", "can_edit_jobs"],
            "added_on": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

## Job Management

### Create Job Posting
**POST** `/jobs/jobs/`

Create a new job posting (company users only).

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
    "title": "string",
    "description": "string",
    "job_type": "full-time | part-time | contract | freelance",
    "work_mode": "remote | hybrid | onsite",
    "tech_stack": ["Python", "React", "AWS"],
    "location": "string",
    "salary_min": "integer",
    "salary_max": "integer",
    "experience_required": "entry | mid | senior | lead",
    "status": "draft | active | closed"
}
```

**Response (201):**
```json
{
    "id": "uuid",
    "company_name": "string",
    "company_location": "string",
    "created_by_username": "string",
    "title": "string",
    "description": "string",
    "job_type": "full-time",
    "work_mode": "remote",
    "tech_stack": ["Python", "React"],
    "location": "San Francisco, CA",
    "salary_min": 120000,
    "salary_max": 180000,
    "experience_required": "mid",
    "status": "active",
    "total_applicants": 0,
    "is_owner": true,
    "created_at": "2024-01-15T10:30:00Z"
}
```

---

### List Job Postings
**GET** `/jobs/jobs/`

Get paginated list of job postings with filters.

**Headers:** `Authorization: Bearer {access_token}`

**Query Parameters:**
- `page` (integer): Page number
- `location` (string): Filter by location
- `job_type` (string): Filter by job type
- `work_mode` (string): Filter by work mode
- `experience` (string): Filter by experience level
- `tech_stack` (string): Filter by technology
- `salary_min` (integer): Minimum salary filter
- `company` (string): Filter by company name

**Response (200):**
```json
{
    "count": 25,
    "next": "http://127.0.0.1:8000/api/jobs/jobs/?page=2",
    "previous": null,
    "results": [
        {
            "id": "uuid",
            "company_name": "Tech Corp",
            "title": "Senior Python Developer",
            "location": "San Francisco, CA",
            "salary_min": 120000,
            "salary_max": 180000,
            "match_score": 85.5,
            "is_wishlisted": false,
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### Get Job Details
**GET** `/jobs/jobs/{job_id}/`

Get detailed information about a specific job.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):** Same as create job response

---

### Update Job Posting
**PUT/PATCH** `/jobs/jobs/{job_id}/`

Update job posting (only by job creator or company admin).

**Headers:** `Authorization: Bearer {access_token}`

**Request/Response:** Same as create job

---

### Delete Job Posting
**DELETE** `/jobs/jobs/{job_id}/`

Delete job posting (only by job creator or company admin).

**Headers:** `Authorization: Bearer {access_token}`

**Response (204):** No content

---

### Add to Wishlist
**POST** `/jobs/wishlist/`

Add job to user's wishlist.

**Headers:** `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
    "job_post": "job_uuid"
}
```

**Response (201):**
```json
{
    "id": "uuid",
    "job_title": "string",
    "company_name": "string",
    "added_on": "2024-01-15T10:30:00Z"
}
```

---

### List Wishlist
**GET** `/jobs/wishlist/`

Get user's wishlisted jobs.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "count": 5,
    "results": [
        {
            "id": "uuid",
            "job_title": "Senior Python Developer",
            "company_name": "Tech Corp",
            "job_location": "San Francisco, CA",
            "salary_range": "120k - 180k",
            "added_on": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### Remove from Wishlist
**DELETE** `/jobs/wishlist/{wishlist_id}/`

Remove job from wishlist.

**Headers:** `Authorization: Bearer {access_token}`

**Response (204):** No content

---

### Job Statistics
**GET** `/jobs/jobs/statistics/`

Get job statistics for company.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "total_jobs": 10,
    "active_jobs": 7,
    "draft_jobs": 2,
    "closed_jobs": 1,
    "total_applications": 45,
    "avg_match_score": 78.5
}
```

---

## Swiping & Matching

### Discover Cards
**GET** `/swipes/discover/`

Get filtered cards to swipe on based on user role.

**Headers:** `Authorization: Bearer {access_token}`

**Query Parameters (optional):**
- `location` (string): Filter by location
- `job_type` (string): Filter jobs by type (for developers)
- `experience` (string): Filter by experience level
- `tech_stack` (string): Filter by technology

**Response for Developers (200):**
```json
{
    "type": "jobs",
    "count": 15,
    "results": [
        {
            "id": "uuid",
            "company_name": "Tech Corp",
            "company_about": "Leading tech company...",
            "title": "Senior Python Developer",
            "description": "We are looking for...",
            "location": "San Francisco, CA",
            "salary_min": 120000,
            "salary_max": 180000,
            "tech_stack": ["Python", "Django", "React"],
            "match_score": 85.5,
            "is_wishlisted": false,
            "created_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

**Response for Companies (200):**
```json
{
    "type": "developers",
    "count": 8,
    "results": [
        {
            "id": "uuid",
            "user_username": "johndoe",
            "bio": "Full-stack developer with 5 years experience",
            "current_location": "New York, NY",
            "experience_years": 5,
            "top_languages": ["Python", "JavaScript", "React"],
            "github_url": "https://github.com/johndoe",
            "portfolio_url": "https://johndoe.dev"
        }
    ]
}
```

---

### Swipe Right
**POST** `/swipes/swipe/`

Create a swipe action with automatic match detection.

**Headers:** `Authorization: Bearer {access_token}`

**Request Body for Job Swipe:**
```json
{
    "swipe_type": "job",
    "job_id": "job_uuid"
}
```

**Request Body for Profile Swipe:**
```json
{
    "swipe_type": "profile", 
    "target_user_id": "user_uuid"
}
```

**Response (201):**
```json
{
    "success": true,
    "swipe_id": "uuid",
    "swipe_type": "job",
    "timestamp": "2024-01-15T10:30:00Z",
    "match_created": true,
    "match": {
        "match_id": "uuid",
        "matched_with": "johndoe",
        "job_title": "Senior Python Developer"
    }
}
```

---

### Dashboard - For Me
**GET** `/swipes/dashboard/?tab=for_me`

Get swipes received by current user.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "tab": "for_me",
    "title": "People/Companies Interested in You",
    "count": 5,
    "results": [
        {
            "id": "uuid",
            "swiper_username": "techcorp",
            "swiped_on_username": "johndoe",
            "job_title": "Senior Python Developer",
            "company_name": "Tech Corp",
            "swipe_type": "job",
            "timestamp": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### Dashboard - Showed Interest
**GET** `/swipes/dashboard/?tab=showed_interest`

Get swipes made by current user.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):** Same structure as "For Me" tab

---

### Dashboard - Matches
**GET** `/swipes/dashboard/?tab=matches`

Get matches for current user.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "tab": "matches", 
    "title": "Your Matches",
    "count": 3,
    "results": [
        {
            "id": "uuid",
            "user_1_username": "johndoe",
            "user_1_role": "developer",
            "user_2_username": "techcorp",
            "user_2_role": "company",
            "job_title": "Senior Python Developer",
            "company_name": "Tech Corp", 
            "status": "active",
            "matched_on": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### Dashboard - Statistics
**GET** `/swipes/dashboard/?tab=stats`

Get user statistics and activity.

**Headers:** `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
    "tab": "stats",
    "title": "Your Statistics", 
    "data": {
        "total_swipes_made": 15,
        "total_swipes_received": 8,
        "total_matches": 3,
        "active_matches": 3,
        "profile_completion": 85.0,
        "recent_activity": [
            "5 swipes this week",
            "2 new matches this week"
        ]
    }
}
```

---

## Data Models

### User
```json
{
    "id": "uuid",
    "username": "string",
    "email": "string (email)",
    "role": "developer | company",
    "is_active": "boolean",
    "status": "active | inactive | pending",
    "last_ping": "datetime",
    "last_profile_update": "datetime",
    "date_joined": "datetime"
}
```

### Developer Profile
```json
{
    "id": "uuid",
    "user": "user_uuid",
    "bio": "text",
    "current_location": "string",
    "experience_years": "integer",
    "top_languages": "array[string]",
    "tools": "array[string]", 
    "github_url": "url",
    "linkedin_url": "url",
    "portfolio_url": "url",
    "salary_expectation_min": "integer",
    "salary_expectation_max": "integer",
    "willing_to_relocate": "boolean",
    "top_two_cities": "array[string]"
}
```

### Company Profile
```json
{
    "id": "uuid",
    "user": "user_uuid",
    "name": "string",
    "about": "text",
    "industry": "string",
    "company_size": "1-10 | 11-50 | 51-200 | 201-500 | 500+",
    "location": "string",
    "headquarters": "string",
    "website": "url",
    "contact_email": "email"
}
```

### Job Posting
```json
{
    "id": "uuid",
    "company": "company_profile_uuid",
    "created_by": "user_uuid",
    "title": "string",
    "description": "text",
    "job_type": "full-time | part-time | contract | freelance",
    "work_mode": "remote | hybrid | onsite",
    "tech_stack": "array[string]",
    "location": "string",
    "salary_min": "integer",
    "salary_max": "integer", 
    "experience_required": "entry | mid | senior | lead",
    "status": "draft | active | closed"
}
```

### Swipe Actions
```json
{
    "id": "uuid",
    "swiper": "user_uuid",
    "swiped_on": "user_uuid",
    "job_post": "job_uuid (optional)",
    "swipe_type": "profile | job",
    "timestamp": "datetime"
}
```

### Match
```json
{
    "id": "uuid",
    "user_1": "user_uuid",
    "user_2": "user_uuid", 
    "job_post": "job_uuid (optional)",
    "status": "active | archived | blocked",
    "matched_on": "datetime"
}
```

---

## Error Handling

### Standard Error Response
```json
{
    "error": "string",
    "message": "string",
    "details": "object (optional)"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request successful, no response body |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

### Common Error Examples

**Validation Error (422):**
```json
{
    "email": ["This field is required."],
    "password": ["This field must be at least 8 characters."]
}
```

**Authentication Error (401):**
```json
{
    "detail": "Given token not valid for any token type",
    "code": "token_not_valid",
    "messages": [
        {
            "token_class": "AccessToken",
            "token_type": "access",
            "message": "Token is invalid or expired"
        }
    ]
}
```

**Permission Error (403):**
```json
{
    "detail": "You do not have permission to perform this action."
}
```

**Resource Not Found (404):**
```json
{
    "detail": "Not found."
}
```

---

## Rate Limiting

- **Authentication endpoints**: 10 requests per minute per IP
- **General endpoints**: 100 requests per minute per user
- **Discover endpoint**: 30 requests per minute per user

---

## Changelog

### v1.0.0 (2024-01-15)
- Initial API release
- Authentication system with JWT
- Profile management for developers and companies
- Job posting and management system
- Swiping logic with automatic matching
- Dashboard with statistics

---

**Last Updated:** June 25, 2025
**API Version:** 1.0.0  
**Contact:** ashmitapandey47@gmail.com