import React from 'react'
import { motion } from 'framer-motion'
import { LogOut, Code, Heart, Bookmark, User, Home, Briefcase } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'

const Header = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Dynamic navigation based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { 
        path: '/dashboard', 
        icon: Home, 
        label: 'Dashboard',
        description: 'Browse & Swipe'
      },
      { 
        path: '/matches', 
        icon: Heart, 
        label: 'Matches',
        description: 'Your Connections'
      },
      { 
        path: '/wishlist', 
        icon: Bookmark, 
        label: 'Wishlist',
        description: 'Saved Items'
      }
    ]

    // Add My Jobs for company users
    if (user?.role === 'company') {
      baseItems.splice(2, 0, {
        path: '/my-jobs',
        icon: Briefcase,
        label: 'My Jobs',
        description: 'Job Management'
      })
    }

    // Add Profile at the end
    baseItems.push({
      path: '/profile', 
      icon: User, 
      label: 'Profile',
      description: 'Your Info'
    })

    return baseItems
  }

  const navigationItems = getNavigationItems()

  const isActivePath = (path) => {
    return location.pathname === path || 
           (path === '/dashboard' && location.pathname === '/')
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section - Consistent with Landing Page */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center shadow-lg">
              <Code className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">SkillSwipe</h1>
          </motion.div>

          {/* Navigation Menu */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="hidden md:flex items-center space-x-1"
          >
            {navigationItems.map((item, index) => {
              const Icon = item.icon
              const isActive = isActivePath(item.path)
              
              return (
                <motion.button
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex flex-col items-center space-y-1 min-w-[80px] ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  <span className="text-xs">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeNavItem"
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl -z-10"
                    />
                  )}
                </motion.button>
              )
            })}
          </motion.nav>

          {/* Mobile Navigation Menu */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:hidden flex items-center space-x-1"
          >
            {navigationItems.slice(0, 3).map((item, index) => {
              const Icon = item.icon
              const isActive = isActivePath(item.path)
              
              return (
                <motion.button
                  key={item.path}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(item.path)}
                  className={`p-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'text-gray-600 hover:bg-primary-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              )
            })}
          </motion.nav>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            {/* Welcome Section - Desktop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden lg:block text-right"
            >
              <p className="text-sm font-medium text-gray-900">
                Welcome, <span className="gradient-text font-semibold">{user?.username}</span>
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role} Dashboard
              </p>
            </motion.div>

            {/* User Avatar */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 bg-gradient-to-r from-primary-100 to-purple-100 rounded-full flex items-center justify-center cursor-pointer"
              onClick={() => navigate('/profile')}
            >
              <span className="text-sm font-semibold text-primary-600">
                {user?.username?.charAt(0)?.toUpperCase()}
              </span>
            </motion.div>

            {/* Logout Button */}
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Animated Bottom Border */}
      <div className="h-0.5 bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 opacity-60"></div>
    </motion.header>
  )
}

export default Header 