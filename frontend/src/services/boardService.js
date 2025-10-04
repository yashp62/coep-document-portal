import api, { buildRoleBasedUrl } from './api'

export const boardService = {
  // Boards are university bodies with type 'Board'
  
  // Get all boards
  getBoards: async (params = {}) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.get(url, { params: { ...params, type: 'Board' } })
    return response.data
  },

  // Get board by ID
  getBoard: async (id) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.get(`${url}/${id}`)
    return response.data
  },

  // Create board
  createBoard: async (data) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const boardData = { ...data, type: 'Board' }
    const response = await api.post(url, boardData)
    return response.data
  },

  // Update board
  updateBoard: async (id, data) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.put(`${url}/${id}`, data)
    return response.data
  },

  // Delete board
  deleteBoard: async (id) => {
    const url = buildRoleBasedUrl('/university-bodies')
    const response = await api.delete(`${url}/${id}`)
    return response.data
  },

  // Get board members
  getBoardMembers: async (boardId) => {
    const url = buildRoleBasedUrl('/users')
    const response = await api.get(url, { params: { university_body_id: boardId } })
    return response.data
  }
}