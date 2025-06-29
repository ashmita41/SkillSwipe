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
        // Skip profile check if we're already on a profile creation page
        const isOnProfileCreationPage = location.pathname === '/create-developer-profile' || 
                                       location.pathname === '/create-company-profile'
        
        if (isOnProfileCreationPage) {
          console.log('Skipping profile status check - already on profile creation page')
          setProfileStatus({ has_profile: false })
          setProfileLoading(false)
          return
        }

        // Check if we're coming from a profile creation page (recently created profile)
        const recentlyCreatedProfile = sessionStorage.getItem('profileJustCreated')
        const profileCreatedTime = sessionStorage.getItem('profileCreatedTime')
        
        if (recentlyCreatedProfile && profileCreatedTime) {
          const timeElapsed = Date.now() - parseInt(profileCreatedTime)
          const cacheValidFor = 10000 // 10 seconds
          
          if (timeElapsed < cacheValidFor) {
            console.log(`Profile was just created ${timeElapsed}ms ago, assuming has_profile: true for ${cacheValidFor - timeElapsed}ms more`)
            setProfileStatus({ has_profile: true })
            setProfileLoading(false)
            
            // Clear the flags when cache expires
            setTimeout(() => {
              console.log('Profile creation cache expired, clearing flags')
              sessionStorage.removeItem('profileJustCreated')
              sessionStorage.removeItem('profileCreatedTime')
            }, cacheValidFor - timeElapsed)
            return
          } else {
            // Cache expired, clear flags and proceed with normal check
            console.log('Profile creation cache expired, clearing flags and checking normally')
            sessionStorage.removeItem('profileJustCreated')
            sessionStorage.removeItem('profileCreatedTime')
          }
        }
        
        try {
          const status = await checkProfileStatus()
          console.log('Profile status check result:', status)
          setProfileStatus(status)
        } catch (error) {
          console.error('Profile status check failed:', error)
          // Don't assume no profile on API failure - could be temporary server issue
          // Only set has_profile: false if we got a clear 404 or profile-not-found response
          if (error.message && error.message.includes('not found')) {
            setProfileStatus({ has_profile: false })
          } else {
            console.warn('Profile status check failed due to server error, assuming profile exists to avoid redirect loop')
            setProfileStatus({ has_profile: true }) // Assume profile exists to avoid redirect loops
          }
        }
      }
      setProfileLoading(false)
    }

    if (!loading) {
      checkProfile()
    }
  }, [isAuthenticated, loading, requireProfile, checkProfileStatus, location.pathname])

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