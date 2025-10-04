import api, { buildRoleBasedUrl } from './api'

export const documentService = {
  // Get all documents with search and filter (public access for unauthenticated, role-based for authenticated)
  getDocuments: async (params = {}) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.get(url, { params })
    return response.data
  },

  // Get document by ID (public access)
  getDocument: async (id) => {
    const response = await api.get(`/documents/${id}`, { forcePublic: true })
    return response.data
  },

  // Download document (public access)
  downloadDocument: async (id) => {
    const response = await api.get(`/documents/${id}/download`, {
      responseType: 'blob'
    })
    return response
  },

  // Upload document (role-based)
  uploadDocument: async (formData) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Update document (role-based)
  updateDocument: async (id, data) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.put(`${url}/${id}`, data)
    return response.data
  },

  // Delete document (role-based)
  deleteDocument: async (id) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.delete(`${url}/${id}`)
    return response.data
  },

  // Get my documents (role-based)
  getMyDocuments: async (params = {}) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.get(url, { params })
    return response.data
  },

  // Get pending documents for admin approval
  getPendingDocuments: async (params = {}) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.get(`${url}/pending`, { params })
    return response.data
  },

  // Approve document (admin only)
  approveDocument: async (id) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.post(`${url}/${id}/approve`)
    return response.data
  },

  // Reject document (admin only)
  rejectDocument: async (id, reason) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.post(`${url}/${id}/reject`, { reason })
    return response.data
  },

  // Get all documents for admin view (shows both public and private)
  getAllDocumentsAdmin: async (params = {}) => {
    const response = await api.get('/documents/admin/all', { params })
    return response.data
  }
}
