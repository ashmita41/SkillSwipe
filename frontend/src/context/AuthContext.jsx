import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')
      const refreshToken = localStorage.getItem('refreshToken')
      const userData = localStorage.getItem('user')

      if (accessToken && userData) {
        try {
          // Parse user data
          const parsedUser = JSON.parse(userData)
          setUser(parsedUser)
          setIsAuthenticated(true)
          
          // Update activity ping
          await authAPI.updateActivity()
        } catch (error) {
          console.error('Auth check failed:', error)
          // Clear invalid tokens
          clearAuthData()
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authAPI.register(userData)
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials)
      
      // Store auth data
      localStorage.setItem('accessToken', response.access)
      localStorage.setItem('refreshToken', response.refresh)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      // Update state
      setUser(response.user)
      setIsAuthenticated(true)
      
      return response
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authAPI.logout(refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthData()
    }
  }

  // Clear authentication data
  const clearAuthData = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  // Refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await authAPI.refreshToken(refreshToken)
      localStorage.setItem('accessToken', response.access)
      return response.access
    } catch (error) {
      console.error('Token refresh failed:', error)
      clearAuthData()
      throw error
    }
  }

  // Check profile status
  const checkProfileStatus = async () => {
    try {
      const response = await authAPI.getProfileStatus()
      return response
    } catch (error) {
      console.error('Profile status check failed:', error)
      throw error
    }
  }

  // Update user activity
  const updateActivity = async () => {
    try {
      await authAPI.updateActivity()
    } catch (error) {
      console.error('Activity update failed:', error)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    register,
    login,
    logout,
    clearAuthData,
    refreshAccessToken,
    checkProfileStatus,
    updateActivity
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext 