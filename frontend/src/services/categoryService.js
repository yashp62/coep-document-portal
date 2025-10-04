import api, { buildRoleBasedUrl } from './api'

export const categoryService = {
  // Categories are actually university bodies with different types
  // This service provides a category-specific interface to university bodies
  
  // Get all categories (alias for university bodies)
  getCategories: async (params = {}) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.get(url, { params: { ...params, type: 'Category' } })
    return response.data
  },

  // Get category by ID
  getCategory: async (id) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.get(`${url}/${id}`)
    return response.data
  },

  // Create category
  createCategory: async (data) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const categoryData = { ...data, type: 'Category' }
    const response = await api.post(url, categoryData)
    return response.data
  },

  // Update category
  updateCategory: async (id, data) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.put(`${url}/${id}`, data)
    return response.data
  },

  // Delete category
  deleteCategory: async (id) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.delete(`${url}/${id}`)
    return response.data
  }
}