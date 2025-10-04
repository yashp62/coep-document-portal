import api, { buildRoleBasedUrl } from './api';

export const universityBodyService = {
  // Get all university bodies with optional filtering (role-based for authenticated, public for unauthenticated)
  getAllUniversityBodies: async (params = {}) => {
    try {
      const url = buildRoleBasedUrl('/university-bodies')
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching university bodies:', error);
      throw error;
    }
  },

  // Get a specific university body by ID (role-based for authenticated, public for unauthenticated)
  getUniversityBodyById: async (id) => {
    try {
      const url = buildRoleBasedUrl('/university-bodies')
      const response = await api.get(`${url}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching university body:', error);
      throw error;
    }
  },

  // Create a new university body (role-based - super admin only)
  createUniversityBody: async (data) => {
    try {
      const url = buildRoleBasedUrl('/university-bodies')
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      console.error('Error creating university body:', error);
      throw error;
    }
  },

  // Update an existing university body (role-based)
  updateUniversityBody: async (id, data) => {
    try {
      const url = buildRoleBasedUrl('/university-bodies')
      const response = await api.put(`${url}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating university body:', error);
      throw error;
    }
  },

  // Delete a university body (role-based - super admin only)
  deleteUniversityBody: async (id) => {
    try {
      const url = buildRoleBasedUrl('/university-bodies')
      const response = await api.delete(`${url}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting university body:', error);
      throw error;
    }
  },

  // Get university bodies by type (role-based for authenticated, public for unauthenticated)
  getUniversityBodiesByType: async (type) => {
    try {
      const url = buildRoleBasedUrl('/university-bodies')
      const response = await api.get(url, { 
        params: { type } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching university bodies by type:', error);
      throw error;
    }
  },

  // Search university bodies (role-based for authenticated, public for unauthenticated)
  searchUniversityBodies: async (query, type = null) => {
    try {
      const params = { search: query };
      if (type) params.type = type;
      
      const url = buildRoleBasedUrl('/university-bodies')
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error('Error searching university bodies:', error);
      throw error;
    }
  }
};

export default universityBodyService;