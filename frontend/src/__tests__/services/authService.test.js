import authService from '../../services/authService';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');
const mockApi = api;

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockResponse = {
      data: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'director',
        },
        token: 'mock-jwt-token',
      },
    };

    it('should login successfully', async () => {
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.login(mockCredentials);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/login', mockCredentials);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle login failure', async () => {
      const errorResponse = {
        response: {
          data: { message: 'Invalid credentials' },
          status: 401,
        },
      };
      mockApi.post.mockRejectedValue(errorResponse);

      await expect(authService.login(mockCredentials)).rejects.toThrow('Invalid credentials');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      mockApi.post.mockRejectedValue(networkError);

      await expect(authService.login(mockCredentials)).rejects.toThrow('Network Error');
    });

    it('should handle validation errors', async () => {
      const validationError = {
        response: {
          data: {
            message: 'Validation failed',
            errors: {
              email: 'Email is required',
              password: 'Password is required',
            },
          },
          status: 400,
        },
      };
      mockApi.post.mockRejectedValue(validationError);

      await expect(authService.login(mockCredentials)).rejects.toThrow('Validation failed');
    });
  });

  describe('register', () => {
    const mockUserData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'director',
    };

    const mockResponse = {
      data: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'director',
        },
        token: 'mock-jwt-token',
      },
    };

    it('should register successfully', async () => {
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.register(mockUserData);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/register', mockUserData);
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle duplicate email error', async () => {
      const duplicateError = {
        response: {
          data: { message: 'Email already exists' },
          status: 409,
        },
      };
      mockApi.post.mockRejectedValue(duplicateError);

      await expect(authService.register(mockUserData)).rejects.toThrow('Email already exists');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { message: 'Logged out successfully' } });

      const result = await authService.logout();

      expect(mockApi.post).toHaveBeenCalledWith('/auth/logout');
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should handle logout errors gracefully', async () => {
      const error = new Error('Logout failed');
      mockApi.post.mockRejectedValue(error);

      // Logout should not throw errors, just log them
      await expect(authService.logout()).resolves.toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    it('should get current user successfully', async () => {
      mockApi.get.mockResolvedValue({ data: { user: mockUser } });

      const result = await authService.getCurrentUser();

      expect(mockApi.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should handle unauthorized access', async () => {
      const unauthorizedError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401,
        },
      };
      mockApi.get.mockRejectedValue(unauthorizedError);

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized');
    });

    it('should handle token expiration', async () => {
      const tokenExpiredError = {
        response: {
          data: { message: 'Token expired' },
          status: 401,
        },
      };
      mockApi.get.mockRejectedValue(tokenExpiredError);

      await expect(authService.getCurrentUser()).rejects.toThrow('Token expired');
    });
  });

  describe('updateProfile', () => {
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

    it('should update profile successfully', async () => {
      mockApi.put.mockResolvedValue({ data: { user: mockUpdatedUser } });

      const result = await authService.updateProfile(mockProfileData);

      expect(mockApi.put).toHaveBeenCalledWith('/auth/profile', mockProfileData);
      expect(result).toEqual(mockUpdatedUser);
    });

    it('should handle profile update validation errors', async () => {
      const validationError = {
        response: {
          data: {
            message: 'Validation failed',
            errors: {
              email: 'Email is already in use',
            },
          },
          status: 400,
        },
      };
      mockApi.put.mockRejectedValue(validationError);

      await expect(authService.updateProfile(mockProfileData)).rejects.toThrow('Validation failed');
    });
  });

  describe('changePassword', () => {
    const mockPasswordData = {
      currentPassword: 'oldpassword',
      newPassword: 'newpassword123',
    };

    it('should change password successfully', async () => {
      mockApi.put.mockResolvedValue({ data: { message: 'Password updated successfully' } });

      const result = await authService.changePassword(mockPasswordData);

      expect(mockApi.put).toHaveBeenCalledWith('/auth/change-password', mockPasswordData);
      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('should handle incorrect current password', async () => {
      const incorrectPasswordError = {
        response: {
          data: { message: 'Current password is incorrect' },
          status: 400,
        },
      };
      mockApi.put.mockRejectedValue(incorrectPasswordError);

      await expect(authService.changePassword(mockPasswordData)).rejects.toThrow('Current password is incorrect');
    });

    it('should handle weak password validation', async () => {
      const weakPasswordError = {
        response: {
          data: {
            message: 'Password validation failed',
            errors: {
              newPassword: 'Password must be at least 8 characters long',
            },
          },
          status: 400,
        },
      };
      mockApi.put.mockRejectedValue(weakPasswordError);

      await expect(authService.changePassword(mockPasswordData)).rejects.toThrow('Password validation failed');
    });
  });

  describe('forgotPassword', () => {
    const mockEmail = 'john@example.com';

    it('should send forgot password email successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { message: 'Reset email sent' } });

      const result = await authService.forgotPassword(mockEmail);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/forgot-password', { email: mockEmail });
      expect(result).toEqual({ message: 'Reset email sent' });
    });

    it('should handle non-existent email', async () => {
      const notFoundError = {
        response: {
          data: { message: 'Email not found' },
          status: 404,
        },
      };
      mockApi.post.mockRejectedValue(notFoundError);

      await expect(authService.forgotPassword(mockEmail)).rejects.toThrow('Email not found');
    });
  });

  describe('resetPassword', () => {
    const mockResetData = {
      token: 'reset-token',
      password: 'newpassword123',
    };

    it('should reset password successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { message: 'Password reset successfully' } });

      const result = await authService.resetPassword(mockResetData);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/reset-password', mockResetData);
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should handle invalid reset token', async () => {
      const invalidTokenError = {
        response: {
          data: { message: 'Invalid or expired reset token' },
          status: 400,
        },
      };
      mockApi.post.mockRejectedValue(invalidTokenError);

      await expect(authService.resetPassword(mockResetData)).rejects.toThrow('Invalid or expired reset token');
    });

    it('should handle expired reset token', async () => {
      const expiredTokenError = {
        response: {
          data: { message: 'Reset token has expired' },
          status: 410,
        },
      };
      mockApi.post.mockRejectedValue(expiredTokenError);

      await expect(authService.resetPassword(mockResetData)).rejects.toThrow('Reset token has expired');
    });
  });

  describe('refreshToken', () => {
    const mockRefreshToken = 'refresh-token';
    const mockNewTokens = {
      token: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    it('should refresh tokens successfully', async () => {
      mockApi.post.mockResolvedValue({ data: mockNewTokens });

      const result = await authService.refreshToken(mockRefreshToken);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh', { refreshToken: mockRefreshToken });
      expect(result).toEqual(mockNewTokens);
    });

    it('should handle invalid refresh token', async () => {
      const invalidTokenError = {
        response: {
          data: { message: 'Invalid refresh token' },
          status: 401,
        },
      };
      mockApi.post.mockRejectedValue(invalidTokenError);

      await expect(authService.refreshToken(mockRefreshToken)).rejects.toThrow('Invalid refresh token');
    });
  });

  describe('verifyEmail', () => {
    const mockVerificationToken = 'verification-token';

    it('should verify email successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { message: 'Email verified successfully' } });

      const result = await authService.verifyEmail(mockVerificationToken);

      expect(mockApi.post).toHaveBeenCalledWith('/auth/verify-email', { token: mockVerificationToken });
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should handle invalid verification token', async () => {
      const invalidTokenError = {
        response: {
          data: { message: 'Invalid verification token' },
          status: 400,
        },
      };
      mockApi.post.mockRejectedValue(invalidTokenError);

      await expect(authService.verifyEmail(mockVerificationToken)).rejects.toThrow('Invalid verification token');
    });
  });
});