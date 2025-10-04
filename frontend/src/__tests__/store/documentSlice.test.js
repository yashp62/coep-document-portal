import { configureStore } from '@reduxjs/toolkit';
import documentSlice, {
  fetchDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  setFilters,
  clearFilters,
  setLoading,
  clearError,
} from '../../store/slices/documentSlice';
import * as documentService from '../../services/documentService';

// Mock document service
jest.mock('../../services/documentService');
const mockDocumentService = documentService;

describe('Document Slice', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        documents: documentSlice,
      },
    });
    jest.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().documents;
      
      expect(state).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        isLoading: false,
        error: null,
        filters: {
          search: '',
          category: '',
          status: '',
          sort: 'created_at',
          order: 'desc',
        },
      });
    });
  });

  describe('synchronous actions', () => {
    it('should handle setFilters action', () => {
      const filters = {
        search: 'test document',
        category: 'Academic',
        status: 'published',
      };

      store.dispatch(setFilters(filters));
      const state = store.getState().documents;

      expect(state.filters).toEqual({
        search: 'test document',
        category: 'Academic',
        status: 'published',
        sort: 'created_at',
        order: 'desc',
      });
    });

    it('should handle clearFilters action', () => {
      // Set some filters first
      store.dispatch(setFilters({
        search: 'test',
        category: 'Academic',
        status: 'draft',
      }));

      store.dispatch(clearFilters());
      const state = store.getState().documents;

      expect(state.filters).toEqual({
        search: '',
        category: '',
        status: '',
        sort: 'created_at',
        order: 'desc',
      });
    });

    it('should handle setLoading action', () => {
      store.dispatch(setLoading(true));
      let state = store.getState().documents;
      expect(state.isLoading).toBe(true);

      store.dispatch(setLoading(false));
      state = store.getState().documents;
      expect(state.isLoading).toBe(false);
    });

    it('should handle clearError action', () => {
      // Set error state first
      store.dispatch({
        type: 'documents/fetchDocuments/rejected',
        payload: 'Fetch failed',
      });

      store.dispatch(clearError());
      const state = store.getState().documents;

      expect(state.error).toBeNull();
    });
  });

  describe('fetchDocuments async thunk', () => {
    const mockDocuments = [
      {
        id: 1,
        title: 'Document 1',
        description: 'Description 1',
        status: 'published',
        category: 'Academic',
      },
      {
        id: 2,
        title: 'Document 2',
        description: 'Description 2',
        status: 'draft',
        category: 'Administrative',
      },
    ];

    const mockResponse = {
      documents: mockDocuments,
      total: 2,
      page: 1,
      limit: 10,
    };

    it('should handle successful documents fetch', async () => {
      mockDocumentService.getDocuments.mockResolvedValue(mockResponse);

      await store.dispatch(fetchDocuments());
      const state = store.getState().documents;

      expect(state.items).toEqual(mockDocuments);
      expect(state.total).toBe(2);
      expect(state.page).toBe(1);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle fetch with filters', async () => {
      const filters = { search: 'test', category: 'Academic' };
      mockDocumentService.getDocuments.mockResolvedValue(mockResponse);

      await store.dispatch(fetchDocuments(filters));

      expect(mockDocumentService.getDocuments).toHaveBeenCalledWith(
        expect.objectContaining(filters)
      );
    });

    it('should handle fetch failure', async () => {
      const errorMessage = 'Failed to fetch documents';
      mockDocumentService.getDocuments.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(fetchDocuments());
      const state = store.getState().documents;

      expect(state.items).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it('should handle loading state', () => {
      mockDocumentService.getDocuments.mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      store.dispatch(fetchDocuments());
      const state = store.getState().documents;

      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('createDocument async thunk', () => {
    const mockDocumentData = {
      title: 'New Document',
      description: 'New document description',
      category: 'Academic',
      status: 'draft',
    };

    const mockCreatedDocument = {
      id: 3,
      ...mockDocumentData,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    };

    it('should handle successful document creation', async () => {
      mockDocumentService.createDocument.mockResolvedValue(mockCreatedDocument);

      await store.dispatch(createDocument(mockDocumentData));
      const state = store.getState().documents;

      expect(state.items).toContain(mockCreatedDocument);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle creation failure', async () => {
      const errorMessage = 'Failed to create document';
      mockDocumentService.createDocument.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(createDocument(mockDocumentData));
      const state = store.getState().documents;

      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    it('should handle validation errors', async () => {
      const validationError = {
        message: 'Validation failed',
        errors: {
          title: 'Title is required',
        },
      };
      mockDocumentService.createDocument.mockRejectedValue(validationError);

      await store.dispatch(createDocument({}));
      const state = store.getState().documents;

      expect(state.error).toBe('Validation failed');
    });
  });

  describe('updateDocument async thunk', () => {
    const mockDocumentId = 1;
    const mockUpdateData = {
      title: 'Updated Document',
      description: 'Updated description',
      status: 'published',
    };

    const mockUpdatedDocument = {
      id: mockDocumentId,
      ...mockUpdateData,
      category: 'Academic',
      created_at: '2024-01-01',
      updated_at: '2024-01-02',
    };

    beforeEach(() => {
      // Set initial documents state
      store.dispatch({
        type: 'documents/fetchDocuments/fulfilled',
        payload: {
          documents: [
            {
              id: 1,
              title: 'Original Document',
              description: 'Original description',
              status: 'draft',
              category: 'Academic',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
        },
      });
    });

    it('should handle successful document update', async () => {
      mockDocumentService.updateDocument.mockResolvedValue(mockUpdatedDocument);

      await store.dispatch(updateDocument({ id: mockDocumentId, data: mockUpdateData }));
      const state = store.getState().documents;

      const updatedDoc = state.items.find(doc => doc.id === mockDocumentId);
      expect(updatedDoc.title).toBe('Updated Document');
      expect(updatedDoc.status).toBe('published');
      expect(state.error).toBeNull();
    });

    it('should handle update failure', async () => {
      const errorMessage = 'Failed to update document';
      mockDocumentService.updateDocument.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(updateDocument({ id: mockDocumentId, data: mockUpdateData }));
      const state = store.getState().documents;

      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    it('should handle updating non-existent document', async () => {
      mockDocumentService.updateDocument.mockRejectedValue(new Error('Document not found'));

      await store.dispatch(updateDocument({ id: 999, data: mockUpdateData }));
      const state = store.getState().documents;

      expect(state.error).toBe('Document not found');
    });
  });

  describe('deleteDocument async thunk', () => {
    const mockDocumentId = 1;

    beforeEach(() => {
      // Set initial documents state
      store.dispatch({
        type: 'documents/fetchDocuments/fulfilled',
        payload: {
          documents: [
            { id: 1, title: 'Document 1' },
            { id: 2, title: 'Document 2' },
          ],
          total: 2,
          page: 1,
          limit: 10,
        },
      });
    });

    it('should handle successful document deletion', async () => {
      mockDocumentService.deleteDocument.mockResolvedValue({});

      await store.dispatch(deleteDocument(mockDocumentId));
      const state = store.getState().documents;

      const deletedDoc = state.items.find(doc => doc.id === mockDocumentId);
      expect(deletedDoc).toBeUndefined();
      expect(state.items).toHaveLength(1);
      expect(state.error).toBeNull();
    });

    it('should handle deletion failure', async () => {
      const errorMessage = 'Failed to delete document';
      mockDocumentService.deleteDocument.mockRejectedValue(new Error(errorMessage));

      await store.dispatch(deleteDocument(mockDocumentId));
      const state = store.getState().documents;

      expect(state.error).toBe(errorMessage);
      expect(state.items).toHaveLength(2); // Documents should remain unchanged
    });

    it('should handle deleting non-existent document', async () => {
      mockDocumentService.deleteDocument.mockRejectedValue(new Error('Document not found'));

      await store.dispatch(deleteDocument(999));
      const state = store.getState().documents;

      expect(state.error).toBe('Document not found');
      expect(state.items).toHaveLength(2);
    });
  });

  describe('pagination handling', () => {
    it('should update pagination data on successful fetch', async () => {
      const mockResponse = {
        documents: [],
        total: 50,
        page: 2,
        limit: 20,
      };

      mockDocumentService.getDocuments.mockResolvedValue(mockResponse);

      await store.dispatch(fetchDocuments({ page: 2, limit: 20 }));
      const state = store.getState().documents;

      expect(state.page).toBe(2);
      expect(state.limit).toBe(20);
      expect(state.total).toBe(50);
    });

    it('should handle page changes', async () => {
      mockDocumentService.getDocuments.mockResolvedValue({
        documents: [],
        total: 30,
        page: 3,
        limit: 10,
      });

      await store.dispatch(fetchDocuments({ page: 3 }));
      const state = store.getState().documents;

      expect(state.page).toBe(3);
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      mockDocumentService.getDocuments.mockRejectedValue(new Error('Network Error'));

      await store.dispatch(fetchDocuments());
      const state = store.getState().documents;

      expect(state.error).toBe('Network Error');
      expect(state.isLoading).toBe(false);
    });

    it('should handle server errors', async () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            message: 'Internal Server Error',
          },
        },
      };
      mockDocumentService.getDocuments.mockRejectedValue(serverError);

      await store.dispatch(fetchDocuments());
      const state = store.getState().documents;

      expect(state.error).toBeTruthy();
    });

    it('should clear errors on successful requests', async () => {
      // Set error state
      store.dispatch({
        type: 'documents/fetchDocuments/rejected',
        payload: 'Previous error',
      });

      // Successful request should clear error
      mockDocumentService.getDocuments.mockResolvedValue({
        documents: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await store.dispatch(fetchDocuments());
      const state = store.getState().documents;

      expect(state.error).toBeNull();
    });
  });

  describe('filter interactions', () => {
    it('should combine filters correctly', () => {
      store.dispatch(setFilters({
        search: 'test',
        category: 'Academic',
      }));

      store.dispatch(setFilters({
        status: 'published',
      }));

      const state = store.getState().documents;
      expect(state.filters).toEqual({
        search: 'test',
        category: 'Academic',
        status: 'published',
        sort: 'created_at',
        order: 'desc',
      });
    });

    it('should reset page when filters change', () => {
      // Set initial page
      store.dispatch({
        type: 'documents/fetchDocuments/fulfilled',
        payload: {
          documents: [],
          total: 0,
          page: 3,
          limit: 10,
        },
      });

      store.dispatch(setFilters({ search: 'new search' }));
      const state = store.getState().documents;

      // Page should reset to 1 when filters change
      expect(state.page).toBe(1);
    });
  });

  describe('concurrent operations', () => {
    it('should handle multiple simultaneous fetches', async () => {
      mockDocumentService.getDocuments
        .mockResolvedValueOnce({
          documents: [{ id: 1, title: 'Doc 1' }],
          total: 1,
          page: 1,
          limit: 10,
        })
        .mockResolvedValueOnce({
          documents: [{ id: 2, title: 'Doc 2' }],
          total: 1,
          page: 1,
          limit: 10,
        });

      const promise1 = store.dispatch(fetchDocuments({ search: 'doc1' }));
      const promise2 = store.dispatch(fetchDocuments({ search: 'doc2' }));

      await Promise.all([promise1, promise2]);
      
      // The last resolved request should win
      const state = store.getState().documents;
      expect(state.items[0].title).toBe('Doc 2');
    });
  });
});