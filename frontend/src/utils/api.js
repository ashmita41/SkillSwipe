const API_BASE_URL = 'http://127.0.0.1:8000/api'

// API utility class for making HTTP requests
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.isRefreshing = false
    this.failedQueue = []
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Process failed queue after token refresh
  processQueue(error, token = null) {
    this.failedQueue.forEach(({ resolve, reject, config }) => {
      if (error) {
        reject(error)
      } else {
        config.headers.Authorization = `Bearer ${token}`
        resolve(this.makeRequest(config))
      }
    })
    
    this.failedQueue = []
  }

  // Refresh access token
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        throw new Error('No refresh token available')
      }

      const response = await fetch(`${this.baseURL}/auth/jwt/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      })

      if (!response.ok) {
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      localStorage.setItem('accessToken', data.access)
      return data.access
    } catch (error) {
      // Clear auth data if refresh fails
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      // Redirect to login
      window.location.href = '/login'
      throw error
    }
  }

  // Make the actual HTTP request
  async makeRequest(config) {
    const response = await fetch(config.url, config)
    const data = await response.json()

    if (!response.ok) {
      // Handle different types of errors
      if (data.detail) {
        throw new Error(data.detail)
      } else if (data.message) {
        throw new Error(data.message)
      } else if (data.errors) {
        // Handle validation errors from backend
        const errorObj = new Error('Validation failed')
        errorObj.validationErrors = data.errors
        throw errorObj
      } else if (typeof data === 'object' && Object.keys(data).length > 0) {
        // Handle field-specific validation errors
        const errorObj = new Error('Validation failed')
        errorObj.validationErrors = data
        throw errorObj
      } else {
        throw new Error(`Request failed with status ${response.status}`)
      }
    }

    return data
  }

  // Generic request method with automatic token refresh
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      url,
      headers: this.getAuthHeaders(),
      ...options
    }

    try {
      return await this.makeRequest(config)
    } catch (error) {
      // Check if this is a 401 error due to expired token
      if (error.message.includes('token') && error.message.includes('expired') ||
          error.message.includes('Given token not valid')) {
        
        // If we're already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject, config })
          })
        }

        this.isRefreshing = true

        try {
          console.log('🔄 Token expired, attempting to refresh...')
          const newToken = await this.refreshToken()
          config.headers.Authorization = `Bearer ${newToken}`
          
          // Process any queued requests
          this.processQueue(null, newToken)
          
          console.log('✅ Token refreshed successfully')
          // Retry the original request with new token
          return await this.makeRequest(config)
        } catch (refreshError) {
          console.error('❌ Token refresh failed:', refreshError)
          this.processQueue(refreshError, null)
          throw refreshError
        } finally {
          this.isRefreshing = false
        }
      }

      // If it's already our custom error, re-throw it
      if (error.validationErrors) {
        throw error
      }
      
      // Handle network errors or JSON parsing errors
      if (error instanceof SyntaxError) {
        throw new Error('Invalid response from server')
      }
      
      throw error
    }
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // PATCH request
  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }
}

// Create API client instance
const apiClient = new ApiClient()

// Authentication API calls
export const authAPI = {
  // Register new user
  register: async (userData) => {
    return apiClient.post('/auth/users/', userData)
  },

  // Login user
  login: async (credentials) => {
    return apiClient.post('/auth/login/', credentials)
  },

  // Refresh access token
  refreshToken: async (refreshToken) => {
    return apiClient.post('/auth/jwt/refresh/', { refresh: refreshToken })
  },

  // Logout user
  logout: async (refreshToken) => {
    return apiClient.post('/auth/logout/', { refresh: refreshToken })
  },

  // Check profile status
  getProfileStatus: async () => {
    return apiClient.get('/auth/profile-status/')
  },

  // Update user activity
  updateActivity: async () => {
    return apiClient.post('/auth/ping/')
  }
}

// Profile API calls
export const profileAPI = {
  // Get developer profile (current user)
  getDeveloperProfile: async () => {
    return apiClient.get('/profiles/developer/me/')
  },

  // Create developer profile
  createDeveloperProfile: async (profileData) => {
    return apiClient.post('/profiles/developer/', profileData)
  },

  // Get company profile (current user)
  getCompanyProfile: async () => {
    return apiClient.get('/profiles/company/me/')
  },

  // Create company profile
  createCompanyProfile: async (profileData) => {
    return apiClient.post('/profiles/company/', profileData)
  },

  // Search companies by name
  searchCompanies: async (searchTerm) => {
    const queryString = new URLSearchParams({ search: searchTerm }).toString()
    return apiClient.get(`/profiles/company/?${queryString}`)
  },

  // Get all companies (for dropdown)
  getAllCompanies: async () => {
    return apiClient.get('/profiles/company/')
  },

  // Get developer profile by ID (for viewing)
  getDeveloperById: async (id) => {
    return apiClient.get(`/profiles/developer/${id}/`)
  },

  // Get company profile by ID (for viewing)
  getCompanyById: async (id) => {
    return apiClient.get(`/profiles/company/${id}/`)
  }
}

// Job API calls
export const jobAPI = {
  // Get job listings
  getJobs: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return apiClient.get(`/jobs/jobs/${queryString ? `?${queryString}` : ''}`)
  },

  // Get job by ID
  getJobById: async (id) => {
    return apiClient.get(`/jobs/jobs/${id}/`)
  },

  // Create job posting
  createJob: async (jobData) => {
    return apiClient.post('/jobs/jobs/', jobData)
  },

  // Get job statistics
  getJobStatistics: async () => {
    return apiClient.get('/jobs/jobs/statistics/')
  }
}

// Swipe API calls
export const swipeAPI = {
  // Get discover cards (filtered cards to swipe on)
  getDiscoverCards: async (filters = {}) => {
    const queryString = new URLSearchParams(filters).toString()
    return apiClient.get(`/swipes/discover/${queryString ? `?${queryString}` : ''}`)
  },

  // Create swipe action
  swipe: async (swipeData) => {
    return apiClient.post('/swipes/swipe/', swipeData)
  },

  // Get dashboard data with tabs
  getDashboard: async (tab = 'for_me') => {
    return apiClient.get(`/swipes/dashboard/?tab=${tab}`)
  },

  // Get matches
  getMatches: async () => {
    return apiClient.get('/swipes/dashboard/?tab=matches')
  }
}

// Wishlist API calls
export const wishlistAPI = {
  // Get wishlist items
  getWishlist: async () => {
    return apiClient.get('/jobs/wishlist/')
  },

  // Add item to wishlist (job or profile)
  addToWishlist: async (jobId, userId = null) => {
    if (jobId) {
      return apiClient.post('/jobs/wishlist/', { job_post_id: jobId })
    } else if (userId) {
      return apiClient.post('/jobs/wishlist/', { wishlisted_user_id: userId })
    }
    throw new Error('Either jobId or userId must be provided')
  },

  // Remove item from wishlist
  removeFromWishlist: async (wishlistId) => {
    return apiClient.delete(`/jobs/wishlist/${wishlistId}/`)
  },

  // Clear entire wishlist
  clearWishlist: async () => {
    return apiClient.delete('/jobs/wishlist/clear/')
  }
}



export default apiClient 