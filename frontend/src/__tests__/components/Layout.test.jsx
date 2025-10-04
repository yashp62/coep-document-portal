import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Layout from '../../components/Layout/Layout';
import authSlice from '../../store/slices/authSlice';

// Mock child components
jest.mock('../../components/Layout/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header Component</div>;
  };
});

jest.mock('../../components/Layout/Sidebar', () => {
  return function MockSidebar({ isCollapsed }) {
    return (
      <div data-testid="sidebar" data-collapsed={isCollapsed}>
        Sidebar Component
      </div>
    );
  };
});

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

describe('Layout Component', () => {
  beforeEach(() => {
    mockUseAuth.user = null;
  });

  it('renders header component', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders children content', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders sidebar when user is authenticated', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('does not render sidebar when user is not authenticated', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
  });

  it('applies proper layout structure for authenticated users', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check main layout structure
    const mainLayout = container.querySelector('.flex.h-screen');
    expect(mainLayout).toBeInTheDocument();
    
    // Check content area
    const mainContent = container.querySelector('.flex-1.overflow-auto');
    expect(mainContent).toBeInTheDocument();
  });

  it('applies proper layout structure for unauthenticated users', () => {
    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Should have single column layout without sidebar
    const mainLayout = container.querySelector('.min-h-screen');
    expect(mainLayout).toBeInTheDocument();
  });

  it('handles sidebar collapse state', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(
      <Layout sidebarCollapsed={true}>
        <div>Test Content</div>
      </Layout>
    );
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'true');
  });

  it('handles sidebar expand state', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(
      <Layout sidebarCollapsed={false}>
        <div>Test Content</div>
      </Layout>
    );
    
    const sidebar = screen.getByTestId('sidebar');
    expect(sidebar).toHaveAttribute('data-collapsed', 'false');
  });

  it('passes custom className to layout container', () => {
    const { container } = renderWithProviders(
      <Layout className="custom-layout">
        <div>Test Content</div>
      </Layout>
    );
    
    expect(container.firstChild).toHaveClass('custom-layout');
  });

  it('applies proper responsive design classes', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check for responsive classes
    const layoutContainer = container.firstChild;
    expect(layoutContainer).toHaveClass('flex', 'h-screen', 'bg-gray-50');
  });

  it('renders loading state when provided', () => {
    renderWithProviders(
      <Layout loading={true}>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('layout-loading')).toBeInTheDocument();
  });

  it('does not render loading state by default', () => {
    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.queryByTestId('layout-loading')).not.toBeInTheDocument();
  });

  it('has proper semantic HTML structure', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Check for main content area
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('handles different user roles properly', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'super_admin',
    };

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('applies proper padding and margins', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    const { container } = renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const mainContent = container.querySelector('main');
    expect(mainContent).toHaveClass('p-6');
  });

  it('handles error boundaries when children fail', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    // Mock console.error to avoid test output noise
    const originalError = console.error;
    console.error = jest.fn();

    try {
      renderWithProviders(
        <Layout>
          <ErrorComponent />
        </Layout>
      );
      
      // Should still render header and sidebar
      expect(screen.getByTestId('header')).toBeInTheDocument();
    } finally {
      console.error = originalError;
    }
  });

  it('supports accessibility features', () => {
    mockUseAuth.user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'director',
    };

    renderWithProviders(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('aria-label', 'Main Content');
    
    // Skip to main content link
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
  });
});