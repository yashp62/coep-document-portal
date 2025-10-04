import api from './api'

// Public API service for unauthenticated access
export const publicApiService = {
  // Get public documents (always use public endpoint)
  getPublicDocuments: async (params = {}) => {
    const response = await api.get('/documents', { params })
    return response.data
  },

  // Get public university bodies (always use public endpoint)
  getPublicUniversityBodies: async (params = {}) => {
    const response = await api.get('/university-bodies', { params })
    return response.data
  },

  // Get public document by ID (always use public endpoint)
  getPublicDocument: async (id) => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },

  // Download public document (always use public endpoint)
  downloadPublicDocument: async (id) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    })
    return response
  },

  // Search public university bodies (always use public endpoint)
  searchPublicUniversityBodies: async (query, type = null) => {
    const params = { search: query };
    if (type) params.type = type;
    
    const response = await api.get('/university-bodies', { params });
    return response.data;
  }
}