import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import Documents from '../../pages/Documents/Documents';
import authSlice from '../../store/slices/authSlice';
import documentSlice from '../../store/slices/documentSlice';
import * as documentService from '../../services/documentService';
import * as categoryService from '../../services/categoryService';

// Mock services
jest.mock('../../services/documentService');
jest.mock('../../services/categoryService');
const mockDocumentService = documentService;
const mockCategoryService = categoryService;

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

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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

describe('Documents Page', () => {
  const mockDocuments = [
    {
      id: 1,
      title: 'Document 1',
      description: 'Description 1',
      status: 'published',
      category: 'Academic',
      file_path: 'document1.pdf',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 2,
      title: 'Document 2',
      description: 'Description 2',
      status: 'draft',
      category: 'Administrative',
      file_path: 'document2.pdf',
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
    },
  ];

  const mockCategories = [
    { id: 1, name: 'Academic' },
    { id: 2, name: 'Administrative' },
    { id: 3, name: 'Research' },
  ];

  beforeEach(() => {
    mockDocumentService.getDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: mockDocuments.length,
      page: 1,
      limit: 10,
    });
    mockCategoryService.getCategories.mockResolvedValue(mockCategories);
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders documents page correctly', async () => {
    renderWithProviders(<Documents />);
    
    expect(screen.getByText('Documents')).toBeInTheDocument();
    expect(screen.getByText('Create Document')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Document 2')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    renderWithProviders(<Documents />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('loads and displays documents list', async () => {
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      expect(screen.getByText('Document 1')).toBeInTheDocument();
      expect(screen.getByText('Description 1')).toBeInTheDocument();
      expect(screen.getByText('Academic')).toBeInTheDocument();
      expect(screen.getByText('Published')).toBeInTheDocument();
      
      expect(screen.getByText('Document 2')).toBeInTheDocument();
      expect(screen.getByText('Description 2')).toBeInTheDocument();
      expect(screen.getByText('Administrative')).toBeInTheDocument();
      expect(screen.getByText('Draft')).toBeInTheDocument();
    });
  });

  it('shows search functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    const searchInput = screen.getByPlaceholderText('Search documents...');
    expect(searchInput).toBeInTheDocument();
    
    await user.type(searchInput, 'Document 1');
    
    await waitFor(() => {
      expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Document 1',
        })
      );
    });
  });

  it('filters documents by category', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const categoryFilter = screen.getByLabelText('Filter by category');
      expect(categoryFilter).toBeInTheDocument();
    });
    
    const categorySelect = screen.getByLabelText('Filter by category');
    await user.selectOptions(categorySelect, '1');
    
    await waitFor(() => {
      expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          category: '1',
        })
      );
    });
  });

  it('filters documents by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    const statusFilter = screen.getByLabelText('Filter by status');
    await user.selectOptions(statusFilter, 'published');
    
    await waitFor(() => {
      expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
        })
      );
    });
  });

  it('navigates to create document page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    const createButton = screen.getByText('Create Document');
    await user.click(createButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/documents/create');
  });

  it('navigates to document detail page', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const documentTitle = screen.getByText('Document 1');
      user.click(documentTitle);
    });
    
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/documents/1');
    });
  });

  it('shows edit and delete actions for each document', async () => {
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const editButtons = screen.getAllByText('Edit');
      const deleteButtons = screen.getAllByText('Delete');
      
      expect(editButtons).toHaveLength(2);
      expect(deleteButtons).toHaveLength(2);
    });
  });

  it('handles document deletion', async () => {
    const user = userEvent.setup();
    mockDocumentService.deleteDocument.mockResolvedValue({});
    
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const deleteButtons = screen.getAllByText('Delete');
      user.click(deleteButtons[0]);
    });
    
    // Confirm deletion
    await waitFor(() => {
      const confirmButton = screen.getByText('Confirm Delete');
      user.click(confirmButton);
    });
    
    await waitFor(() => {
      expect(mockDocumentService.deleteDocument).toHaveBeenCalledWith(1);
    });
  });

  it('shows pagination when there are many documents', async () => {
    mockDocumentService.getDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 50,
      page: 1,
      limit: 10,
    });
    
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      expect(screen.getByText('Next')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('handles page navigation', async () => {
    const user = userEvent.setup();
    mockDocumentService.getDocuments.mockResolvedValue({
      documents: mockDocuments,
      total: 50,
      page: 1,
      limit: 10,
    });
    
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const nextButton = screen.getByText('Next');
      user.click(nextButton);
    });
    
    await waitFor(() => {
      expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 2,
        })
      );
    });
  });

  it('shows empty state when no documents found', async () => {
    mockDocumentService.getDocuments.mockResolvedValue({
      documents: [],
      total: 0,
      page: 1,
      limit: 10,
    });
    
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      expect(screen.getByText('No documents found')).toBeInTheDocument();
      expect(screen.getByText('Create your first document')).toBeInTheDocument();
    });
  });

  it('handles bulk actions', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const checkboxes = screen.getAllByRole('checkbox');
      user.click(checkboxes[0]); // Select first document
    });
    
    expect(screen.getByText('1 selected')).toBeInTheDocument();
    expect(screen.getByText('Delete Selected')).toBeInTheDocument();
  });

  it('shows document upload functionality', async () => {
    renderWithProviders(<Documents />);
    
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    mockDocumentService.uploadDocument.mockResolvedValue({
      id: 3,
      title: 'test.pdf',
    });
    
    renderWithProviders(<Documents />);
    
    const fileInput = screen.getByLabelText('Choose file');
    await user.upload(fileInput, file);
    
    await waitFor(() => {
      expect(mockDocumentService.uploadDocument).toHaveBeenCalled();
    });
  });

  it('shows sorting options', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    const sortSelect = screen.getByLabelText('Sort by');
    await user.selectOptions(sortSelect, 'updated_at_desc');
    
    await waitFor(() => {
      expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'updated_at',
          order: 'desc',
        })
      );
    });
  });

  it('handles error state when API fails', async () => {
    mockDocumentService.getDocuments.mockRejectedValue(new Error('API Error'));
    
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      expect(screen.getByText('Error loading documents')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('shows document preview functionality', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const previewButtons = screen.getAllByText('Preview');
      expect(previewButtons).toHaveLength(2);
    });
  });

  it('displays document metadata correctly', async () => {
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      expect(screen.getByText('Jan 1, 2024')).toBeInTheDocument();
      expect(screen.getByText('Jan 2, 2024')).toBeInTheDocument();
    });
  });

  it('shows proper status badges', async () => {
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const publishedBadge = screen.getByText('Published');
      const draftBadge = screen.getByText('Draft');
      
      expect(publishedBadge).toHaveClass('bg-green-100', 'text-green-800');
      expect(draftBadge).toHaveClass('bg-yellow-100', 'text-yellow-800');
    });
  });

  it('supports keyboard navigation', async () => {
    renderWithProviders(<Documents />);
    
    await waitFor(() => {
      const firstDocument = screen.getByText('Document 1');
      fireEvent.keyDown(firstDocument, { key: 'Enter' });
    });
    
    expect(mockNavigate).toHaveBeenCalledWith('/documents/1');
  });
});