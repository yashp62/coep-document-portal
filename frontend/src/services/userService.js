import api, { buildRoleBasedUrl } from './api'

export const userService = {
  // Get all users (role-based)
  getUsers: async (params = {}) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.get(url, { params })
    return response.data
  },

  // Get user by ID (role-based)
  getUser: async (id) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.get(`${url}/${id}`)
    return response.data
  },

  // Create user (role-based)
  createUser: async (data) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.post(url, data)
    return response.data
  },

  // Update user (role-based)
  updateUser: async (id, data) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.put(`${url}/${id}`, data)
    return response.data
  },

  // Delete user (role-based - super admin only)
  deleteUser: async (id) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.delete(`${url}/${id}`)
    return response.data
  },

  // Toggle user status (role-based - super admin only)
  toggleUserStatus: async (id) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.put(`${url}/${id}/toggle-status`)
    return response.data
  },

  // Get user count (role-based)
  getUserCount: async () => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.get(url, { params: { limit: 1 } })
    return response.data.data.pagination?.totalUsers || 0
  },

  // Get own profile (sub-admin specific)
  getProfile: async () => {
    const url = buildRoleBasedUrl('/users/profile')
    const response = await api.get(url)
    return response.data
  },

  // Update own profile (sub-admin specific)
  updateProfile: async (data) => {
    const url = buildRoleBasedUrl('/users/profile')
    const response = await api.put(url, data)
    return response.data
  }
}
