import { configureStore } from '@reduxjs/toolkit';
import userSlice, {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  setFilters,
  clearFilters,
  setLoading,
  clearError,
} from '../../store/slices/userSlice';
import * as userService from '../../services/userService';

// Mock user service
jest.mock('../../services/userService');
const mockUserService = userService;

describe('User Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        users: userSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().users;
      
      expect(state).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        isLoading: false,
        error: null,
        filters: {
          search: '',
          role: '',
          status: '',
          sort: 'created_at',
          order: 'desc',
        },
      });
    });
  });

  describe('fetchUsers async thunk', () => {
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
      users: mockUsers,
      total: 2,
      page: 1,
      limit: 10,
    };

    it('should handle successful users fetch', async () => {
      mockUserService.getUsers.mockResolvedValue(mockResponse);

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.items).toEqual(mockUsers);
      expect(state.total).toBe(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch failure', async () => {
      const errorMessage = 'Failed to fetch users';
      mockUserService.getUsers.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchUsers());
      const state = store.getState().users;

      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('createUser async thunk', () => {
    const mockUserData = {
      name: 'New User',
      email: 'newuser@example.com',
      role: 'director',
      password: 'password123',
    };

    const mockCreatedUser = {
      id: 3,
      ...mockUserData,
      status: 'active',
      created_at: '2024-01-01',
    };

    it('should handle successful user creation', async () => {
      mockUserService.createUser.mockResolvedValue(mockCreatedUser);

      await store.dispatch(createUser(mockUserData));
      const state = store.getState().users;

      expect(state.items).toContain(mockCreatedUser);
      expect(state.error).toBeNull();
    });

    it('should handle creation failure', async () => {
      const errorMessage = 'Failed to create user';
      mockUserService.createUser.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(createUser(mockUserData));
      const state = store.getState().users;

      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateUser async thunk', () => {
    const mockUserId = 1;
    const mockUpdateData = {
      name: 'Updated User',
      email: 'updated@example.com',
      role: 'super_admin',
    };

    beforeEach(() => {
      store.dispatch({
        type: 'users/fetchUsers/fulfilled',
        payload: {
          users: [
            { id: 1, name: 'Original User', email: 'original@example.com', role: 'director' },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      });
    });

    it('should handle successful user update', async () => {
      const mockUpdatedUser = { id: mockUserId, ...mockUpdateData };
      mockUserService.updateUser.mockResolvedValue(mockUpdatedUser);

      await store.dispatch(updateUser({ id: mockUserId, data: mockUpdateData }));
      const state = store.getState().users;

      const updatedUser = state.items.find(user => user.id === mockUserId);
      expect(updatedUser.name).toBe('Updated User');
      expect(updatedUser.role).toBe('super_admin');
    });
  });

  describe('deleteUser async thunk', () => {
    beforeEach(() => {
      store.dispatch({
        type: 'users/fetchUsers/fulfilled',
        payload: {
          users: [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      });
    });

    it('should handle successful user deletion', async () => {
      mockUserService.deleteUser.mockResolvedValue({});

      await store.dispatch(deleteUser(1));
      const state = store.getState().users;

      expect(state.items).toHaveLength(1);
      expect(state.items.find(user => user.id === 1)).toBeUndefined();
    });
  });
});