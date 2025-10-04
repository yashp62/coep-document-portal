import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../../pages/Auth/Login';
import authSlice from '../../store/slices/authSlice';
import * as authService from '../../services/authService';

// Mock authService
jest.mock('../../services/authService');
const mockAuthService = authService;

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ state: { from: { pathname: '/' } } }),
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: initialState,
  });
};

const renderWithProviders = (
  component,
  { initialState = {}, ...renderOptions } = {}
) => {
  const store = createMockStore(initialState);
  
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return render(component, { wrapper: Wrapper, ...renderOptions });
};

describe('Login Page', () => {
  beforeEach(() => {
    mockAuthService.login.mockClear();
    mockNavigate.mockClear();
  });

  it('renders login form correctly', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);
    
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);
    
    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
      token: 'mock-token',
    };
    
    mockAuthService.login.mockResolvedValue(mockUser);
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles login error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    
    mockAuthService.login.mockRejectedValue(new Error(errorMessage));
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('shows loading state during login', async () => {
    const user = userEvent.setup();
    
    // Mock a delayed response
    mockAuthService.login.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'director',
        token: 'mock-token',
      }), 1000))
    );
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(screen.getByText('Signing in...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('redirects already authenticated users', () => {
    const initialState = {
      auth: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          role: 'director',
        },
        token: 'existing-token',
        isLoading: false,
        error: null,
      },
    };
    
    renderWithProviders(<Login />, { initialState });
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    
    mockAuthService.login.mockRejectedValue(new Error('Network Error'));
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Network Error')).toBeInTheDocument();
    });
  });

  it('clears error message when user starts typing', async () => {
    const user = userEvent.setup();
    
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'));
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    
    // Trigger error
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
    
    // Start typing to clear error
    await user.clear(passwordInput);
    await user.type(passwordInput, 'new');
    
    expect(screen.queryByText('Invalid credentials')).not.toBeInTheDocument();
  });

  it('handles form submission with Enter key', async () => {
    const user = userEvent.setup();
    const mockUser = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
      token: 'mock-token',
    };
    
    mockAuthService.login.mockResolvedValue(mockUser);
    
    renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.keyboard('{Enter}');
    
    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'john@example.com',
        password: 'password123',
      });
    });
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<Login />);
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
    
    const emailInput = screen.getByLabelText(/email/i);
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
    
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toHaveAttribute('type', 'submit');
  });

  it('shows forgot password link', () => {
    renderWithProviders(<Login />);
    
    const forgotPasswordLink = screen.getByText('Forgot your password?');
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(forgotPasswordLink.closest('a')).toHaveAttribute('href', '/forgot-password');
  });

  it('shows sign up link for new users', () => {
    renderWithProviders(<Login />);
    
    expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
    
    const signUpLink = screen.getByText('Sign up');
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink.closest('a')).toHaveAttribute('href', '/register');
  });

  it('remembers user preference for "Remember me"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Login />);
    
    const rememberMeCheckbox = screen.getByLabelText(/remember me/i);
    expect(rememberMeCheckbox).not.toBeChecked();
    
    await user.click(rememberMeCheckbox);
    expect(rememberMeCheckbox).toBeChecked();
  });

  it('preserves form data when component rerenders', async () => {
    const user = userEvent.setup();
    const { rerender } = renderWithProviders(<Login />);
    
    const emailInput = screen.getByLabelText(/email/i);
    await user.type(emailInput, 'john@example.com');
    
    rerender(<Login />);
    
    expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument();
  });
});