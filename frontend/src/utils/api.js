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
        throw new Error(data.detail || data.message || 'Something went wrong')
      }

      return data
    } catch (error) {
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