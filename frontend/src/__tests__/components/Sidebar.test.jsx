import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Sidebar from '../../components/Layout/Sidebar';
import authSlice from '../../store/slices/authSlice';

// Mock useAuth hook
const mockUseAuth = {
  user: null,
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

describe('Sidebar Component', () => {
  beforeEach(() => {
    mockUseAuth.user = null;
  });

  it('renders sidebar when user is authenticated', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('does not render sidebar when user is not authenticated', () => {
    renderWithProviders(<Sidebar />);
    
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('shows dashboard link for all authenticated users', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Dashboard').closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('shows documents link for all authenticated users', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Documents').closest('a')).toHaveAttribute('href', '/documents');
  });

  it('shows users link only for super_admin', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'super_admin',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Users').closest('a')).toHaveAttribute('href', '/users');
  });

  it('does not show users link for director role', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.queryByText('Users')).not.toBeInTheDocument();
  });

  it('shows university bodies link for all authenticated users', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.getByText('University Bodies')).toBeInTheDocument();
    expect(screen.getByText('University Bodies').closest('a')).toHaveAttribute('href', '/university-bodies');
  });

  it('shows categories link for all authenticated users', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.getByText('Categories')).toBeInTheDocument();
    expect(screen.getByText('Categories').closest('a')).toHaveAttribute('href', '/categories');
  });

  it('highlights active navigation item', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    // Mock current location
    delete window.location;
    window.location = { pathname: '/documents' };

    renderWithProviders(<Sidebar />);
    
    const documentsLink = screen.getByText('Documents').closest('a');
    expect(documentsLink).toHaveClass('bg-primary-100', 'text-primary-700');
  });

  it('shows proper icons for navigation items', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    // Check for dashboard icon
    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
    
    // Check for documents icon
    expect(screen.getByTestId('documents-icon')).toBeInTheDocument();
    
    // Check for university bodies icon
    expect(screen.getByTestId('university-bodies-icon')).toBeInTheDocument();
    
    // Check for categories icon
    expect(screen.getByTestId('categories-icon')).toBeInTheDocument();
  });

  it('shows users icon only for super_admin', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'super_admin',
    };

    renderWithProviders(<Sidebar />);
    
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('handles sidebar collapse/expand', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar isCollapsed={false} />);
    
    // Check if full sidebar is visible
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Documents')).toBeInTheDocument();
  });

  it('shows only icons when sidebar is collapsed', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar isCollapsed={true} />);
    
    // Icons should be visible
    expect(screen.getByTestId('dashboard-icon')).toBeInTheDocument();
    expect(screen.getByTestId('documents-icon')).toBeInTheDocument();
    
    // Text should be hidden or have different styling
    const dashboardText = screen.getByText('Dashboard');
    expect(dashboardText).toHaveClass('sr-only');
  });

  it('has proper accessibility attributes', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main Navigation');
    
    // Check links have proper aria-labels
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('handles keyboard navigation', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    const dashboardLink = screen.getByText('Dashboard');
    fireEvent.keyDown(dashboardLink, { key: 'Enter', code: 'Enter' });
    
    // Should navigate to dashboard
    expect(dashboardLink.closest('a')).toHaveAttribute('href', '/dashboard');
  });

  it('shows proper hover states', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(<Sidebar />);
    
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    
    fireEvent.mouseEnter(dashboardLink);
    expect(dashboardLink).toHaveClass('hover:bg-gray-100');
  });
});