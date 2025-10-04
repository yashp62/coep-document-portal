import axios from 'axios'
import toast from 'react-hot-toast'

// API Base URL configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://coep-backend.onrender.com' 
    : 'http://localhost:5000')

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout for cloud deployment
  headers: {
    'Content-Type': 'application/json',
  },
})

// Helper function to get user role from localStorage
const getUserRole = () => {
  const user = localStorage.getItem('user')
  if (user) {
    try {
      const userData = JSON.parse(user)
      return userData.role
    } catch (error) {
      console.error('Error parsing user data:', error)
      return null
    }
  }
  return null
}

// Helper function to get role-specific API prefix
const getRolePrefix = (role) => {
  switch (role) {
    case 'super_admin':
      return '/super-admin'
    case 'admin':
      return '/admin'
    case 'sub_admin':
      return '/sub-admin'
    default:
      return ''
  }
}

// Helper function to build role-specific URL
export const buildRoleBasedUrl = (endpoint, forcePublic = false) => {
  if (forcePublic) {
    return endpoint
  }
  
  const role = getUserRole()
  if (!role) {
    return endpoint // Use public endpoints if no role
  }
  
  const rolePrefix = getRolePrefix(role)
  return `${rolePrefix}${endpoint}`
}

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          toast.error('Access denied. Insufficient permissions.')
          break
        case 404:
          toast.error('Resource not found.')
          break
        case 422:
          // Validation errors
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(error => {
              toast.error(error.msg || error.message)
            })
          } else {
            toast.error(data.message || 'Validation failed.')
          }
          break
        // 429 rate limit handling removed
        case 500:
          toast.error('Server error. Please try again later.')
          break
        default:
          toast.error(data.message || 'An error occurred.')
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.')
    } else {
      toast.error('An unexpected error occurred.')
    }
    
    return Promise.reject(error)
  }
)

export default api
