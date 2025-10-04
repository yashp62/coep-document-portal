import api, { buildRoleBasedUrl } from './api'

export const committeeService = {
  // Committees are university bodies with type 'Committee'
  
  // Get all committees
  getCommittees: async (params = {}) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.get(url, { params: { ...params, type: 'Committee' } })
    return response.data
  },

  // Get committee by ID
  getCommittee: async (id) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.get(`${url}/${id}`)
    return response.data
  },

  // Create committee
  createCommittee: async (data) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const committeeData = { ...data, type: 'Committee' }
    const response = await api.post(url, committeeData)
    return response.data
  },

  // Update committee
  updateCommittee: async (id, data) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.put(`${url}/${id}`, data)
    return response.data
  },

  // Delete committee
  deleteCommittee: async (id) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.delete(`${url}/${id}`)
    return response.data
  },

  // Get committee members
  getCommitteeMembers: async (committeeId) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.get(url, { params: { university_body_id: committeeId } })
    return response.data
  },

  // Get committee documents
  getCommitteeDocuments: async (committeeId, params = {}) => {
    const url = buildRoleBasedUrl('/documents')
    const response = await api.get(url, { params: { ...params, university_body_id: committeeId } })
    return response.data
  }
}