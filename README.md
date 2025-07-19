# SkillSwipe

A modern hiring platform that connects developers and companies through an intelligent swipe-based matching system. Built with React, Django, and PostgreSQL.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Installation](#installation)
- [API Documentation](#api-documentation)
- [User Flows](#user-flows)
- [Project Structure](#project-structure)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

## Overview

SkillSwipe revolutionizes the hiring process by providing a Tinder-like experience for job matching. Developers can discover job opportunities by swiping through curated job postings, while companies can find talent by browsing developer profiles. The platform uses intelligent matching algorithms to ensure relevant connections between candidates and employers.

### Key Benefits

- **Streamlined Matching**: Reduces time-to-hire through efficient swiping mechanisms
- **Intelligent Recommendations**: Algorithm-driven matching based on skills, experience, and preferences
- **Role-Based Dashboards**: Tailored experiences for developers and companies
- **Real-Time Interactions**: Instant match notifications and messaging capabilities

## Features

### For Developers
- **Job Discovery**: Browse curated job opportunities with swipe interactions
- **Profile Management**: Comprehensive developer profiles with skills, experience, and portfolio links
- **Wishlist System**: Save interesting job postings for later review
- **Match Tracking**: View companies that have shown interest and mutual matches
- **Personalized Filters**: Customize job recommendations based on location, salary, and technology stack

### For Companies
- **Talent Discovery**: Browse developer profiles with detailed skill assessments
- **Job Management**: Create, edit, and manage job postings with real-time statistics
- **Candidate Tracking**: Monitor application statuses and manage hiring pipelines
- **Advanced Analytics**: Comprehensive insights into job performance and candidate engagement
- **Developer Bookmarking**: Save and organize developer profiles of interest

### Core Dashboard Features
- **For Me Tab**: Personalized recommendations (jobs for developers, developers for companies)
- **Showed Interest Tab**: Profiles/jobs that have expressed interest in you
- **My Swipes Tab**: History of your right swipes and interactions
- **Anti-Repetition Logic**: Smart filtering prevents seeing the same profiles across tabs
- **Role-Specific Wishlists**: Developers save jobs, companies save developer profiles

## Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library for smooth interactions
- **React Router** - Client-side routing
- **React Tinder Card** - Swipe gesture implementation

### Backend
- **Django 4.2** - High-level Python web framework
- **Django REST Framework** - Powerful toolkit for building APIs
- **PostgreSQL** - Advanced open-source relational database
- **JWT Authentication** - Secure token-based authentication with automatic refresh
- **Django CORS Headers** - Cross-Origin Resource Sharing support

### Development Tools
- **ESLint** - JavaScript linting utility
- **Prettier** - Code formatting tool
- **Git** - Version control system
- **Node.js** - JavaScript runtime environment
- **Python 3.9+** - Backend programming language

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn
- Python 3.9+
- PostgreSQL 12+
- Git

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd SkillSwipe/backend
```

2. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure database settings in `skillswipe_backend/settings.py`

5. Run migrations:
```bash
python manage.py migrate
```

6. Create superuser:
```bash
python manage.py createsuperuser
```

7. Start development server:
```bash
python manage.py runserver
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure API endpoint in `.env`:
```env
VITE_API_URL=http://127.0.0.1:8000/api
```

5. Start development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## API Documentation

Complete API documentation is available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md).

### Key Endpoints

- **Authentication**: `/api/auth/`
- **Profiles**: `/api/profiles/`
- **Jobs**: `/api/jobs/`
- **Swipes & Matching**: `/api/swipes/`
- **Dashboard**: `/api/swipes/dashboard/`
- **Wishlist**: `/api/jobs/wishlist/`

### Authentication
The API uses JWT tokens with automatic refresh functionality. Include the Bearer token in the Authorization header:
Authorization: Bearer <access_token>


## User Flows

### Developer Flow
1. **Registration & Profile Setup**: Create account and complete developer profile
2. **Job Discovery**: Browse jobs in "For Me" tab with customizable filters
3. **Interaction Management**: 
   - Swipe right on interesting jobs
   - Save jobs to wishlist for later
   - View companies that showed interest
4. **Match Management**: Connect with matched companies and manage conversations

### Company Flow
1. **Registration & Profile Setup**: Create account and complete company profile
2. **Job Creation**: Create first job posting or manage existing jobs
3. **Talent Discovery**: Browse developer profiles with job-specific filtering
4. **Candidate Management**:
   - Swipe right on qualified developers
   - Bookmark developer profiles
   - View developers who showed interest in jobs
5. **Analytics Dashboard**: Monitor job performance and candidate engagement

## Project Structure
SkillSwipe/
├── backend/
│ ├── skillswipe_backend/
│ │ ├── authentication/ # User auth and JWT management
│ │ ├── profiles/ # User profile management
│ │ ├── jobs/ # Job postings and wishlist
│ │ ├── swipes/ # Swipe actions and matching
│ │ └── skillswipe_backend/ # Django settings
│ ├── requirements.txt
│ └── manage.py
├── frontend/
│ ├── src/
│ │ ├── components/ # Reusable UI components
│ │ ├── pages/ # Page components
│ │ ├── context/ # React context providers
│ │ └── utils/ # API client and utilities
│ ├── package.json
│ └── vite.config.js
├── README.md
└── API_DOCUMENTATION.md


## Screenshots

### Dashboard Views
*Screenshots can be added here to showcase the user interface*

- Dashboard overview with three main tabs
- Swipeable card interface
- Profile creation forms
- Job management interface
- Match notification system

## Contributing

We welcome contributions to SkillSwipe! Please follow these guidelines:

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards
4. Test your changes thoroughly
5. Commit using conventional commit format: `feat: add amazing feature`
6. Push to your fork and submit a pull request


