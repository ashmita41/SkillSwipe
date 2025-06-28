import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { User, Building, ArrowRight, Code } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

const ProfileSetupPage = () => {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const handleLogout = async () => {
    try {
      await logout()
      // Navigation will happen automatically via useEffect when isAuthenticated becomes false
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center"
      >
        {/* Header */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg mb-8"
        >
          <Code className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold gradient-text mb-4"
        >
          Welcome to SkillSwipe, {user?.username}!
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-600 mb-8"
        >
          You've successfully logged in as a{' '}
          <span className="font-semibold text-primary-600 capitalize">
            {user?.role}
          </span>
        </motion.p>

        {/* Success Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            {user?.role === 'developer' ? (
              <User className="w-16 h-16 text-primary-500" />
            ) : (
              <Building className="w-16 h-16 text-primary-500" />
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Complete! ✨
          </h2>

          <p className="text-gray-600 mb-6">
            Step 2 of the SkillSwipe frontend development is now complete. The authentication 
            system is fully functional and integrated with the backend API.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">What's Working:</h3>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>✅ User Registration with role selection</li>
              <li>✅ User Login with JWT authentication</li>
              <li>✅ Token management and storage</li>
              <li>✅ Form validation and error handling</li>
              <li>✅ Beautiful UI with purple gradient theme</li>
              <li>✅ Responsive design for all devices</li>
              <li>✅ Logout functionality with proper redirection</li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mb-6">
            In Step 3, we'll implement the profile creation system where users will 
            complete their {user?.role} profiles as required by the business logic.
          </p>

          <div className="space-y-4">
            <Button size="lg" className="w-full">
              Coming in Step 3: Complete Profile
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button 
              variant="outline" 
              size="lg" 
              className="w-full"
              onClick={handleLogout}
            >
              Test Logout & Try Again
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-sm text-gray-500"
        >
          <p>Your user data: {user?.email} | Role: {user?.role} | ID: {user?.id}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default ProfileSetupPage 