import api from './api'

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response.data
  },

  // Get current user profile
  getProfile: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  // Verify token
  verifyToken: async (token) => {
    const response = await api.post('/auth/verify-token', { token })
    return response.data
  },

  // Set token in localStorage
  setToken: (token) => {
    localStorage.setItem('token', token)
  },

  // Get token from localStorage
  getToken: () => {
    return localStorage.getItem('token')
  },

  // Remove token from localStorage
  removeToken: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },

  // Set user data in localStorage
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
  },

  // Get user data from localStorage
  getUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    return !!(token && user)
  },

  // Check if user has specific role
  hasRole: (role) => {
    const user = authService.getUser()
    return user && user.role === role
  },

  // Check if user has any of the specified roles
  hasAnyRole: (roles) => {
    const user = authService.getUser()
    return user && roles.includes(user.role)
  },

  // Check if user is director or super admin
  isDirector: () => {
    return authService.hasAnyRole(['director', 'super_admin'])
  },

  // Check if user is super admin
  isSuperAdmin: () => {
    return authService.hasRole('super_admin')
  }
}
