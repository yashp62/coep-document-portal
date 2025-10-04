import userService from '../../services/userService';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');
const mockApi = api;

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    const mockUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'director',
        status: 'active',
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'super_admin',
        status: 'active',
      },
    ];

    const mockResponse = {
      data: {
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
      },
    };

    it('should fetch users successfully', async () => {
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await userService.getUsers();

      expect(mockApi.get).toHaveBeenCalledWith('/users', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch users with filters', async () => {
      const filters = {
        search: 'john',
        role: 'director',
        status: 'active',
        page: 2,
        limit: 20,
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await userService.getUsers(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/users', { params: filters });
    });

    it('should handle unauthorized access', async () => {
      const authError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401,
        },
      };
      mockApi.get.mockRejectedValue(authError);

      await expect(userService.getUsers()).rejects.toThrow('Unauthorized');
    });

    it('should handle permission denied', async () => {
      const permissionError = {
        response: {
          data: { message: 'Insufficient permissions' },
          status: 403,
        },
      };
      mockApi.get.mockRejectedValue(permissionError);

      await expect(userService.getUsers()).rejects.toThrow('Insufficient permissions');
    });
  });

  describe('getUser', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
      status: 'active',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('should fetch single user successfully', async () => {
      mockApi.get.mockResolvedValue({ data: { user: mockUser } });

      const result = await userService.getUser(1);

      expect(mockApi.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockUser);
    });

    it('should handle user not found', async () => {
      const notFoundError = {
        response: {
          data: { message: 'User not found' },
          status: 404,
        },
      };
      mockApi.get.mockRejectedValue(notFoundError);

      await expect(userService.getUser(999)).rejects.toThrow('User not found');
    });
  });

  describe('createUser', () => {
    const mockUserData = {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password123',
      role: 'director',
    };

    const mockCreatedUser = {
      id: 3,
      ...mockUserData,
      status: 'active',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('should create user successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { user: mockCreatedUser } });

      const result = await userService.createUser(mockUserData);

      expect(mockApi.post).toHaveBeenCalledWith('/users', mockUserData);
      expect(result).toEqual(mockCreatedUser);
    });

    it('should handle validation errors', async () => {
      const validationError = {
        response: {
          data: {
            message: 'Validation failed',
            errors: {
              email: 'Email is required',
              password: 'Password must be at least 6 characters',
            },
          },
          status: 400,
        },
      };
      mockApi.post.mockRejectedValue(validationError);

      await expect(userService.createUser({})).rejects.toThrow('Validation failed');
    });

    it('should handle duplicate email error', async () => {
      const duplicateError = {
        response: {
          data: { message: 'Email already exists' },
          status: 409,
        },
      };
      mockApi.post.mockRejectedValue(duplicateError);

      await expect(userService.createUser(mockUserData)).rejects.toThrow('Email already exists');
    });

    it('should handle insufficient permissions', async () => {
      const permissionError = {
        response: {
          data: { message: 'Only super_admin can create users' },
          status: 403,
        },
      };
      mockApi.post.mockRejectedValue(permissionError);

      await expect(userService.createUser(mockUserData)).rejects.toThrow('Only super_admin can create users');
    });
  });

  describe('updateUser', () => {
    const mockUserId = 1;
    const mockUpdateData = {
      name: 'Updated User',
      email: 'updated@example.com',
      role: 'super_admin',
    };

    const mockUpdatedUser = {
      id: mockUserId,
      ...mockUpdateData,
      status: 'active',
      updated_at: '2024-01-02',
    };

    it('should update user successfully', async () => {
      mockApi.put.mockResolvedValue({ data: { user: mockUpdatedUser } });

      const result = await userService.updateUser(mockUserId, mockUpdateData);

      expect(mockApi.put).toHaveBeenCalledWith(`/users/${mockUserId}`, mockUpdateData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should handle user not found on update', async () => {
      const notFoundError = {
        response: {
          data: { message: 'User not found' },
          status: 404,
        },
      };
      mockApi.put.mockRejectedValue(notFoundError);

      await expect(userService.updateUser(999, mockUpdateData)).rejects.toThrow('User not found');
    });

    it('should handle email conflict on update', async () => {
      const conflictError = {
        response: {
          data: { message: 'Email already in use' },
          status: 409,
        },
      };
      mockApi.put.mockRejectedValue(conflictError);

      await expect(userService.updateUser(mockUserId, { email: 'existing@example.com' })).rejects.toThrow('Email already in use');
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockApi.delete.mockResolvedValue({ data: { message: 'User deleted successfully' } });

      const result = await userService.deleteUser(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual({ message: 'User deleted successfully' });
    });

    it('should handle user not found on delete', async () => {
      const notFoundError = {
        response: {
          data: { message: 'User not found' },
          status: 404,
        },
      };
      mockApi.delete.mockRejectedValue(notFoundError);

      await expect(userService.deleteUser(999)).rejects.toThrow('User not found');
    });

    it('should handle self-deletion prevention', async () => {
      const selfDeleteError = {
        response: {
          data: { message: 'Cannot delete your own account' },
          status: 400,
        },
      };
      mockApi.delete.mockRejectedValue(selfDeleteError);

      await expect(userService.deleteUser(1)).rejects.toThrow('Cannot delete your own account');
    });

    it('should handle permission error for user deletion', async () => {
      const permissionError = {
        response: {
          data: { message: 'Insufficient permissions to delete user' },
          status: 403,
        },
      };
      mockApi.delete.mockRejectedValue(permissionError);

      await expect(userService.deleteUser(1)).rejects.toThrow('Insufficient permissions to delete user');
    });
  });

  describe('getUserStats', () => {
    const mockStats = {
      totalUsers: 25,
      activeUsers: 20,
      inactiveUsers: 5,
      roleCounts: {
        super_admin: 2,
        director: 23,
      },
    };

    it('should fetch user statistics successfully', async () => {
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await userService.getUserStats();

      expect(mockApi.get).toHaveBeenCalledWith('/users/stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle stats fetch error', async () => {
      const error = new Error('Failed to fetch user stats');
      mockApi.get.mockRejectedValue(error);

      await expect(userService.getUserStats()).rejects.toThrow('Failed to fetch user stats');
    });
  });

  describe('activateUser', () => {
    it('should activate user successfully', async () => {
      mockApi.patch.mockResolvedValue({ data: { message: 'User activated successfully' } });

      const result = await userService.activateUser(1);

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/activate');
      expect(result).toEqual({ message: 'User activated successfully' });
    });

    it('should handle user not found on activation', async () => {
      const notFoundError = {
        response: {
          data: { message: 'User not found' },
          status: 404,
        },
      };
      mockApi.patch.mockRejectedValue(notFoundError);

      await expect(userService.activateUser(999)).rejects.toThrow('User not found');
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      mockApi.patch.mockResolvedValue({ data: { message: 'User deactivated successfully' } });

      const result = await userService.deactivateUser(1);

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/deactivate');
      expect(result).toEqual({ message: 'User deactivated successfully' });
    });

    it('should handle self-deactivation prevention', async () => {
      const selfDeactivateError = {
        response: {
          data: { message: 'Cannot deactivate your own account' },
          status: 400,
        },
      };
      mockApi.patch.mockRejectedValue(selfDeactivateError);

      await expect(userService.deactivateUser(1)).rejects.toThrow('Cannot deactivate your own account');
    });
  });

  describe('changeUserRole', () => {
    const mockRoleData = { role: 'super_admin' };

    it('should change user role successfully', async () => {
      mockApi.patch.mockResolvedValue({ data: { message: 'User role updated successfully' } });

      const result = await userService.changeUserRole(1, mockRoleData.role);

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/role', mockRoleData);
      expect(result).toEqual({ message: 'User role updated successfully' });
    });

    it('should handle invalid role', async () => {
      const invalidRoleError = {
        response: {
          data: { message: 'Invalid role specified' },
          status: 400,
        },
      };
      mockApi.patch.mockRejectedValue(invalidRoleError);

      await expect(userService.changeUserRole(1, 'invalid_role')).rejects.toThrow('Invalid role specified');
    });

    it('should handle insufficient permissions for role change', async () => {
      const permissionError = {
        response: {
          data: { message: 'Only super_admin can change user roles' },
          status: 403,
        },
      };
      mockApi.patch.mockRejectedValue(permissionError);

      await expect(userService.changeUserRole(1, 'super_admin')).rejects.toThrow('Only super_admin can change user roles');
    });
  });

  describe('resetUserPassword', () => {
    const mockPasswordData = { password: 'newpassword123' };

    it('should reset user password successfully', async () => {
      mockApi.patch.mockResolvedValue({ data: { message: 'Password reset successfully' } });

      const result = await userService.resetUserPassword(1, mockPasswordData.password);

      expect(mockApi.patch).toHaveBeenCalledWith('/users/1/reset-password', mockPasswordData);
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should handle weak password validation', async () => {
      const weakPasswordError = {
        response: {
          data: {
            message: 'Password validation failed',
            errors: {
              password: 'Password must be at least 6 characters long',
            },
          },
          status: 400,
        },
      };
      mockApi.patch.mockRejectedValue(weakPasswordError);

      await expect(userService.resetUserPassword(1, '123')).rejects.toThrow('Password validation failed');
    });
  });

  describe('searchUsers', () => {
    const mockSearchResults = {
      users: [
        { id: 1, name: 'John Doe', email: 'john@example.com', relevance: 0.95 },
        { id: 2, name: 'Jane Doe', email: 'jane@example.com', relevance: 0.87 },
      ],
      total: 2,
      query: 'doe',
    };

    it('should search users successfully', async () => {
      mockApi.get.mockResolvedValue({ data: mockSearchResults });

      const result = await userService.searchUsers('doe');

      expect(mockApi.get).toHaveBeenCalledWith('/users/search', {
        params: { q: 'doe' },
      });
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle empty search results', async () => {
      const emptyResults = {
        users: [],
        total: 0,
        query: 'nonexistent',
      };
      mockApi.get.mockResolvedValue({ data: emptyResults });

      const result = await userService.searchUsers('nonexistent');

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});