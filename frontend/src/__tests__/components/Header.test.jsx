import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Header from '../../components/Layout/Header';
import authSlice from '../../store/slices/authSlice';

// Mock useAuth hook
const mockUseAuth = {
  user: null,
  logout: jest.fn(),
};

jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => mockUseAuth,
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

describe('Header Component', () => {
  beforeEach(() => {
    mockUseAuth.user = null;
    mockUseAuth.logout.mockClear();
  });

  it('renders header with brand name', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('SDS System')).toBeInTheDocument();
  });

  it('shows login button when user is not authenticated', () => {
    renderWithProviders(<Header />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('shows user menu when user is authenticated', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Header />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Login')).not.toBeInTheDocument();
  });

  it('shows profile and logout options in user menu', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Header />);
    
    const userMenuButton = screen.getByText('John Doe');
    fireEvent.click(userMenuButton);
    
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('calls logout function when logout is clicked', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Header />);
    
    const userMenuButton = screen.getByText('John Doe');
    fireEvent.click(userMenuButton);
    
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    expect(mockUseAuth.logout).toHaveBeenCalledTimes(1);
  });

  it('navigates to profile when profile is clicked', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Header />);
    
    const userMenuButton = screen.getByText('John Doe');
    fireEvent.click(userMenuButton);
    
    const profileLink = screen.getByText('Profile');
    expect(profileLink.closest('a')).toHaveAttribute('href', '/profile');
  });

  it('navigates to login when login button is clicked', () => {
    renderWithProviders(<Header />);
    
    const loginLink = screen.getByText('Login');
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });

  it('shows different user roles correctly', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'super_admin',
    };

    renderWithProviders(<Header />);
    
    expect(screen.getByText('Admin User')).toBeInTheDocument();
  });

  it('handles mobile menu toggle', () => {
    renderWithProviders(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(mobileMenuButton);
    
    // Check if mobile menu is visible
    const mobileMenu = screen.getByTestId('mobile-menu');
    expect(mobileMenu).toBeVisible();
  });

  it('closes mobile menu when clicked outside', () => {
    renderWithProviders(<Header />);
    
    const mobileMenuButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(mobileMenuButton);
    
    // Click outside to close menu
    fireEvent.mouseDown(document.body);
    
    const mobileMenu = screen.queryByTestId('mobile-menu');
    expect(mobileMenu).not.toBeVisible();
  });

  it('displays brand logo correctly', () => {
    renderWithProviders(<Header />);
    
    const logo = screen.getByAltText('SDS Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', expect.stringContaining('logo'));
  });

  it('has proper accessibility attributes', () => {
    renderWithProviders(<Header />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    const brand = screen.getByText('SDS System');
    expect(brand).toHaveAttribute('href', '/');
  });

  it('shows notification indicator when user has notifications', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
      hasNotifications: true,
    };

    renderWithProviders(<Header />);
    
    const notificationIndicator = screen.getByTestId('notification-indicator');
    expect(notificationIndicator).toBeInTheDocument();
  });

  it('hides notification indicator when user has no notifications', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
      hasNotifications: false,
    };

    renderWithProviders(<Header />);
    
    const notificationIndicator = screen.queryByTestId('notification-indicator');
    expect(notificationIndicator).not.toBeInTheDocument();
  });
});