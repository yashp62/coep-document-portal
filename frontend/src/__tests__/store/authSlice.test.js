import { configureStore } from '@reduxjs/toolkit';
import authSlice, {
  login,
  logout,
  updateProfile,
  clearError,
  setLoading,
} from '../../store/slices/authSlice';
import * as authService from '../../services/authService';

// Mock auth service
jest.mock('../../services/authService');
const mockAuthService = authService;

describe('Auth Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().auth;
      
      expect(state).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
    });
  });

  describe('synchronous actions', () => {
    it('should handle logout action', () => {
      // Set initial authenticated state
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, name: 'John Doe' },
          token: 'mock-token',
        },
      });

      store.dispatch(logout());
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle clearError action', () => {
      // Set error state
      store.dispatch({
        type: 'auth/login/rejected',
        payload: 'Login failed',
      });

      store.dispatch(clearError());
      const state = store.getState().auth;

      expect(state.error).toBeNull();
    });

    it('should handle setLoading action', () => {
      store.dispatch(setLoading(true));
      let state = store.getState().auth;
      expect(state.isLoading).toBe(true);

      store.dispatch(setLoading(false));
      state = store.getState().auth;
      expect(state.isLoading).toBe(false);
    });
  });

  describe('login async thunk', () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockResponse = {
      user: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'director',
      },
      token: 'mock-jwt-token',
    };

    it('should handle successful login', async () => {
      mockAuthService.login.mockResolvedValue(mockResponse);

      await store.dispatch(login(mockCredentials));
      const state = store.getState().auth;

      expect(state.user).toEqual(mockResponse.user);
      expect(state.token).toEqual(mockResponse.token);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle login loading state', () => {
      mockAuthService.login.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      store.dispatch(login(mockCredentials));
      const state = store.getState().auth;

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockAuthService.login.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(login(mockCredentials));
      const state = store.getState().auth;

      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle network errors', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Network Error'));

      await store.dispatch(login(mockCredentials));
      const state = store.getState().auth;

      expect(state.error).toBe('Network Error');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateProfile async thunk', () => {
    const mockProfileData = {
      name: 'John Smith',
      email: 'johnsmith@example.com',
    };

    const mockUpdatedUser = {
      id: 1,
      name: 'John Smith',
      email: 'johnsmith@example.com',
      role: 'director',
    };

    beforeEach(() => {
      // Set initial authenticated state
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, name: 'John Doe', email: 'john@example.com', role: 'director' },
          token: 'mock-token',
        },
      });
    });

    it('should handle successful profile update', async () => {
      mockAuthService.updateProfile.mockResolvedValue(mockUpdatedUser);

      await store.dispatch(updateProfile(mockProfileData));
      const state = store.getState().auth;

      expect(state.user).toEqual(mockUpdatedUser);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle profile update failure', async () => {
      const errorMessage = 'Update failed';
      mockAuthService.updateProfile.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(updateProfile(mockProfileData));
      const state = store.getState().auth;

      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    it('should handle validation errors', async () => {
      const validationError = {
        message: 'Validation Error',
        errors: {
          email: 'Email is already in use',
        },
      };
      mockAuthService.updateProfile.mockRejectedValue(validationError);

      await store.dispatch(updateProfile(mockProfileData));
      const state = store.getState().auth;

      expect(state.error).toBe('Validation Error');
    });
  });

  describe('selectors and derived state', () => {
    it('should correctly determine authentication status', () => {
      let state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);

      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, name: 'John Doe' },
          token: 'mock-token',
        },
      });

      state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
    });

    it('should handle token expiration', () => {
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, name: 'John Doe' },
          token: 'expired-token',
        },
      });

      // Simulate token expiration
      store.dispatch(logout());
      const state = store.getState().auth;

      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });

  describe('error handling', () => {
    it('should handle malformed error responses', async () => {
      mockAuthService.login.mockRejectedValue({
        response: {
          data: {
            message: 'Server Error',
          },
        },
      });

      await store.dispatch(login({ email: 'test@example.com', password: 'test' }));
      const state = store.getState().auth;

      expect(state.error).toBeTruthy();
    });

    it('should handle missing error messages', async () => {
      mockAuthService.login.mockRejectedValue({});

      await store.dispatch(login({ email: 'test@example.com', password: 'test' }));
      const state = store.getState().auth;

      expect(state.error).toBeTruthy();
    });
  });

  describe('state persistence', () => {
    it('should maintain state after successful login', () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'director' };
      const mockToken = 'persistent-token';

      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: mockUser,
          token: mockToken,
        },
      });

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.token).toEqual(mockToken);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should clear all auth state on logout', () => {
      // Set initial state
      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: { id: 1, name: 'John Doe' },
          token: 'mock-token',
        },
      });

      // Logout
      store.dispatch(logout());
      const state = store.getState().auth;

      expect(state).toEqual({
        user: null,
        token: null,
        isLoading: false,
        error: null,
        isAuthenticated: false,
      });
    });
  });

  describe('concurrent requests', () => {
    it('should handle multiple login attempts correctly', async () => {
      const mockCredentials1 = { email: 'user1@example.com', password: 'pass1' };
      const mockCredentials2 = { email: 'user2@example.com', password: 'pass2' };

      mockAuthService.login
        .mockResolvedValueOnce({
          user: { id: 1, name: 'User 1' },
          token: 'token1',
        })
        .mockResolvedValueOnce({
          user: { id: 2, name: 'User 2' },
          token: 'token2',
        });

      // Start both requests
      const promise1 = store.dispatch(login(mockCredentials1));
      const promise2 = store.dispatch(login(mockCredentials2));

      await Promise.all([promise1, promise2]);
      
      // The last resolved request should win
      const state = store.getState().auth;
      expect(state.user.id).toBe(2);
      expect(state.token).toBe('token2');
    });
  });

  describe('role-based functionality', () => {
    it('should handle different user roles', () => {
      const adminUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        role: 'super_admin',
      };

      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: adminUser,
          token: 'admin-token',
        },
      });

      const state = store.getState().auth;
      expect(state.user.role).toBe('super_admin');
    });

    it('should handle director role', () => {
      const directorUser = {
        id: 2,
        name: 'Director User',
        email: 'director@example.com',
        role: 'director',
      };

      store.dispatch({
        type: 'auth/login/fulfilled',
        payload: {
          user: directorUser,
          token: 'director-token',
        },
      });

      const state = store.getState().auth;
      expect(state.user.role).toBe('director');
    });
  });
});