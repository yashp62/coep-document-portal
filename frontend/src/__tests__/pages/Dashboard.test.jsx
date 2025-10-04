import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Dashboard from '../../pages/Dashboard/Dashboard';
import authSlice from '../../store/slices/authSlice';
import documentSlice from '../../store/slices/documentSlice';
import * as documentService from '../../services/documentService';
import * as userService from '../../services/userService';

// Mock services
jest.mock('../../services/documentService');
jest.mock('../../services/userService');
const mockDocumentService = documentService;
const mockUserService = userService;

// Mock useAuth hook
const mockUseAuth = {
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'director',
  },
};

jest.mock('../../hooks/useAuth', () => ({
  __esModule: true,
  default: () => mockUseAuth,
}));

// Mock Chart.js
jest.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart">Bar Chart</div>,
  Doughnut: () => <div data-testid="doughnut-chart">Doughnut Chart</div>,
}));

jest.mock('chart.js', () => ({
  Chart: {
    register: jest.fn(),
  },
  CategoryScale: {},
  LinearScale: {},
  BarElement: {},
  Title: {},
  Tooltip: {},
  Legend: {},
  ArcElement: {},
}));

const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
      documents: documentSlice,
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

describe('Dashboard Page', () => {
  const mockDocuments = [
    {
      id: 1,
      title: 'Document 1',
      status: 'published',
      category: 'Academic',
      created_at: '2024-01-01',
    },
    {
      id: 2,
      title: 'Document 2',
      status: 'draft',
      category: 'Administrative',
      created_at: '2024-01-02',
    },
    {
      id: 3,
      title: 'Document 3',
      status: 'published',
      category: 'Academic',
      created_at: '2024-01-03',
    },
  ];

  const mockStats = {
    totalDocuments: 150,
    publishedDocuments: 120,
    draftDocuments: 30,
    totalUsers: 25,
    activeUsers: 20,
    totalCategories: 8,
  };

  beforeEach(() => {
    mockDocumentService.getDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: mockDocuments.length,
    });
    mockDocumentService.getDocumentStats.mockResolvedValue(mockStats);
    mockUserService.getUserStats.mockResolvedValue({
      totalUsers: 25,
      activeUsers: 20,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders dashboard welcome message', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByText('Welcome back, John!')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('displays loading state initially', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('loads and displays statistics cards', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Documents')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      
      expect(screen.getByText('Published')).toBeInTheDocument();
      expect(screen.getByText('120')).toBeInTheDocument();
      
      expect(screen.getByText('Draft')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
    });
  });

  it('displays recent documents section', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Documents')).toBeInTheDocument();
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
      expect(screen.getByText('Document 3')).toBeInTheDocument();
    });
  });

  it('shows document status badges correctly', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      const publishedBadges = screen.getAllByText('Published');
      const draftBadges = screen.getAllByText('Draft');
      
      expect(publishedBadges).toHaveLength(3); // 2 documents + 1 stat card
      expect(draftBadges).toHaveLength(2); // 1 document + 1 stat card
    });
  });

  it('displays charts when data is loaded', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      expect(screen.getByTestId('doughnut-chart')).toBeInTheDocument();
    });
  });

  it('shows "View All Documents" link', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      const viewAllLink = screen.getByText('View All Documents');
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/documents');
    });
  });

  it('handles error state when API calls fail', async () => {
    mockDocumentService.getDocuments.mockRejectedValue(new Error('API Error'));
    mockDocumentService.getDocumentStats.mockRejectedValue(new Error('Stats Error'));
    
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading dashboard data')).toBeInTheDocument();
    });
  });

  it('shows quick actions for authenticated users', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      expect(screen.getByText('Create Document')).toBeInTheDocument();
      expect(screen.getByText('Manage Categories')).toBeInTheDocument();
    });
  });

  it('shows admin-specific sections for super_admin users', async () => {
    mockUseAuth.user.role = 'super_admin';
    
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('System Settings')).toBeInTheDocument();
    });
  });

  it('hides admin sections for director users', async () => {
    mockUseAuth.user.role = 'director';
    
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.queryByText('User Management')).not.toBeInTheDocument();
      expect(screen.queryByText('System Settings')).not.toBeInTheDocument();
    });
  });

  it('displays activity feed', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    });
  });

  it('shows empty state when no recent documents', async () => {
    mockDocumentService.getDocuments.mockResolvedValue({
      documents: [],
      total: 0,
    });
    
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No recent documents found')).toBeInTheDocument();
      expect(screen.getByText('Create your first document')).toBeInTheDocument();
    });
  });

  it('refreshes data when refresh button is clicked', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      const refreshButton = screen.getByText('Refresh');
      refreshButton.click();
    });
    
    expect(mockDocumentService.getDocuments).toHaveBeenCalledTimes(2);
    expect(mockDocumentService.getDocumentStats).toHaveBeenCalledTimes(2);
  });

  it('formats dates correctly in recent documents', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 3, 2024')).toBeInTheDocument();
    });
  });

  it('shows correct document categories', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Academic')).toBeInTheDocument();
      expect(screen.getByText('Administrative')).toBeInTheDocument();
    });
  });

  it('handles responsive layout correctly', () => {
    renderWithProviders(<Dashboard />);
    
    const container = screen.getByTestId('dashboard-container');
    expect(container).toHaveClass('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-4');
  });

  it('shows search functionality in header', () => {
    renderWithProviders(<Dashboard />);
    
    expect(screen.getByPlaceholderText('Search documents...')).toBeInTheDocument();
  });

  it('displays notification badge when user has unread notifications', async () => {
    mockUseAuth.user.unreadNotifications = 5;
    
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    });
  });

  it('shows system health status', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('System Status')).toBeInTheDocument();
      expect(screen.getByText('All systems operational')).toBeInTheDocument();
    });
  });

  it('renders performance metrics charts', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Document Statistics')).toBeInTheDocument();
      expect(screen.getByText('Category Distribution')).toBeInTheDocument();
    });
  });

  it('shows export functionality', async () => {
    renderWithProviders(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Export Data')).toBeInTheDocument();
      expect(screen.getByText('Download Report')).toBeInTheDocument();
    });
  });
});