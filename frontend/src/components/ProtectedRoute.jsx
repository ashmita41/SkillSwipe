import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './ui/LoadingSpinner'

const ProtectedRoute = ({ children, requireProfile = true }) => {
  const { isAuthenticated, loading, user, checkProfileStatus } = useAuth()
  const [profileStatus, setProfileStatus] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkProfile = async () => {
      if (isAuthenticated && requireProfile) {
        try {
          const status = await checkProfileStatus()
          setProfileStatus(status)
        } catch (error) {
          console.error('Profile status check failed:', error)
          setProfileStatus({ has_profile: false })
        }
      }
      setProfileLoading(false)
    }

    if (!loading) {
      checkProfile()
    }
  }, [isAuthenticated, loading, requireProfile, checkProfileStatus])

  // Show loading spinner while checking auth or profile
  if (loading || (requireProfile && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // If profile is required, check profile status
  if (requireProfile && profileStatus) {
    const { has_profile } = profileStatus

    // If user doesn't have a profile, redirect to profile creation
    if (!has_profile) {
      const profileCreationPath = user?.role === 'developer' 
        ? '/create-developer-profile' 
        : '/create-company-profile'
      
      // Don't redirect if already on profile creation page
      if (location.pathname !== profileCreationPath) {
        return <Navigate to={profileCreationPath} replace />
      }
    }

    // If user has profile but is on profile creation page, redirect to dashboard
    if (has_profile && (
      location.pathname === '/create-developer-profile' || 
      location.pathname === '/create-company-profile'
    )) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children
}

export default ProtectedRoute 