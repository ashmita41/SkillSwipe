const API_BASE_URL = 'http://127.0.0.1:8000/api'

// API utility class for making HTTP requests
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  // Get authorization headers
  getAuthHeaders() {
    const token = localStorage.getItem('accessToken')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      headers: this.getAuthHeaders(),
      ...options
    }

    try {
      const response = await fetch(url, config)
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
    } catch (error) {
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

// Profile API calls (for future use)
export const profileAPI = {
  // Get developer profile
  getDeveloperProfile: async () => {
    return apiClient.get('/profiles/developer/')
  },

  // Create developer profile
  createDeveloperProfile: async (profileData) => {
    return apiClient.post('/profiles/developer/', profileData)
  },

  // Get company profile
  getCompanyProfile: async () => {
    return apiClient.get('/profiles/company/')
  },

  // Create company profile
  createCompanyProfile: async (profileData) => {
    return apiClient.post('/profiles/company/', profileData)
  }
}

export default apiClient 