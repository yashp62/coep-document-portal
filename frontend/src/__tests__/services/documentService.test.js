import documentService from '../../services/documentService';
import api from '../../services/api';

// Mock the api module
jest.mock('../../services/api');
const mockApi = api;

describe('DocumentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDocuments', () => {
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
      data: {
        documents: mockDocuments,
        total: 2,
        page: 1,
        limit: 10,
      },
    };

    it('should fetch documents successfully', async () => {
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await documentService.getDocuments();

      expect(mockApi.get).toHaveBeenCalledWith('/documents', { params: {} });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch documents with filters', async () => {
      const filters = {
        search: 'test',
        category: 'Academic',
        status: 'published',
        page: 2,
        limit: 20,
      };

      mockApi.get.mockResolvedValue(mockResponse);

      await documentService.getDocuments(filters);

      expect(mockApi.get).toHaveBeenCalledWith('/documents', { params: filters });
    });

    it('should handle fetch error', async () => {
      const error = new Error('Failed to fetch documents');
      mockApi.get.mockRejectedValue(error);

      await expect(documentService.getDocuments()).rejects.toThrow('Failed to fetch documents');
    });

    it('should handle server errors', async () => {
      const serverError = {
        response: {
          data: { message: 'Internal server error' },
          status: 500,
        },
      };
      mockApi.get.mockRejectedValue(serverError);

      await expect(documentService.getDocuments()).rejects.toThrow('Internal server error');
    });
  });

  describe('getDocument', () => {
    const mockDocument = {
      id: 1,
      title: 'Test Document',
      description: 'Test Description',
      status: 'published',
      category: 'Academic',
      file_path: 'document.pdf',
    };

    it('should fetch single document successfully', async () => {
      mockApi.get.mockResolvedValue({ data: { document: mockDocument } });

      const result = await documentService.getDocument(1);

      expect(mockApi.get).toHaveBeenCalledWith('/documents/1');
      expect(result).toEqual(mockDocument);
    });

    it('should handle document not found', async () => {
      const notFoundError = {
        response: {
          data: { message: 'Document not found' },
          status: 404,
        },
      };
      mockApi.get.mockRejectedValue(notFoundError);

      await expect(documentService.getDocument(999)).rejects.toThrow('Document not found');
    });
  });

  describe('createDocument', () => {
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

    it('should create document successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { document: mockCreatedDocument } });

      const result = await documentService.createDocument(mockDocumentData);

      expect(mockApi.post).toHaveBeenCalledWith('/documents', mockDocumentData);
      expect(result).toEqual(mockCreatedDocument);
    });

    it('should handle validation errors', async () => {
      const validationError = {
        response: {
          data: {
            message: 'Validation failed',
            errors: {
              title: 'Title is required',
              category: 'Category is required',
            },
          },
          status: 400,
        },
      };
      mockApi.post.mockRejectedValue(validationError);

      await expect(documentService.createDocument({})).rejects.toThrow('Validation failed');
    });

    it('should handle authorization errors', async () => {
      const authError = {
        response: {
          data: { message: 'Unauthorized' },
          status: 401,
        },
      };
      mockApi.post.mockRejectedValue(authError);

      await expect(documentService.createDocument(mockDocumentData)).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateDocument', () => {
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
      updated_at: '2024-01-02',
    };

    it('should update document successfully', async () => {
      mockApi.put.mockResolvedValue({ data: { document: mockUpdatedDocument } });

      const result = await documentService.updateDocument(mockDocumentId, mockUpdateData);

      expect(mockApi.put).toHaveBeenCalledWith(`/documents/${mockDocumentId}`, mockUpdateData);
      expect(result).toEqual(mockUpdatedDocument);
    });

    it('should handle update validation errors', async () => {
      const validationError = {
        response: {
          data: {
            message: 'Validation failed',
            errors: {
              title: 'Title cannot be empty',
            },
          },
          status: 400,
        },
      };
      mockApi.put.mockRejectedValue(validationError);

      await expect(documentService.updateDocument(mockDocumentId, { title: '' })).rejects.toThrow('Validation failed');
    });

    it('should handle document not found', async () => {
      const notFoundError = {
        response: {
          data: { message: 'Document not found' },
          status: 404,
        },
      };
      mockApi.put.mockRejectedValue(notFoundError);

      await expect(documentService.updateDocument(999, mockUpdateData)).rejects.toThrow('Document not found');
    });
  });

  describe('deleteDocument', () => {
    it('should delete document successfully', async () => {
      mockApi.delete.mockResolvedValue({ data: { message: 'Document deleted successfully' } });

      const result = await documentService.deleteDocument(1);

      expect(mockApi.delete).toHaveBeenCalledWith('/documents/1');
      expect(result).toEqual({ message: 'Document deleted successfully' });
    });

    it('should handle delete authorization error', async () => {
      const authError = {
        response: {
          data: { message: 'Forbidden' },
          status: 403,
        },
      };
      mockApi.delete.mockRejectedValue(authError);

      await expect(documentService.deleteDocument(1)).rejects.toThrow('Forbidden');
    });

    it('should handle document not found on delete', async () => {
      const notFoundError = {
        response: {
          data: { message: 'Document not found' },
          status: 404,
        },
      };
      mockApi.delete.mockRejectedValue(notFoundError);

      await expect(documentService.deleteDocument(999)).rejects.toThrow('Document not found');
    });
  });

  describe('uploadDocument', () => {
    const mockFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    const mockUploadData = {
      title: 'Uploaded Document',
      category: 'Academic',
      description: 'Uploaded file',
    };

    const mockUploadedDocument = {
      id: 4,
      title: 'Uploaded Document',
      file_path: 'uploads/test.pdf',
      status: 'draft',
    };

    it('should upload document successfully', async () => {
      mockApi.post.mockResolvedValue({ data: { document: mockUploadedDocument } });

      const result = await documentService.uploadDocument(mockFile, mockUploadData);

      expect(mockApi.post).toHaveBeenCalledWith('/documents/upload', expect.any(FormData), {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      expect(result).toEqual(mockUploadedDocument);
    });

    it('should handle file size error', async () => {
      const fileSizeError = {
        response: {
          data: { message: 'File too large' },
          status: 413,
        },
      };
      mockApi.post.mockRejectedValue(fileSizeError);

      await expect(documentService.uploadDocument(mockFile, mockUploadData)).rejects.toThrow('File too large');
    });

    it('should handle unsupported file type', async () => {
      const fileTypeError = {
        response: {
          data: { message: 'Unsupported file type' },
          status: 400,
        },
      };
      mockApi.post.mockRejectedValue(fileTypeError);

      await expect(documentService.uploadDocument(mockFile, mockUploadData)).rejects.toThrow('Unsupported file type');
    });
  });

  describe('downloadDocument', () => {
    it('should download document successfully', async () => {
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });
      mockApi.get.mockResolvedValue({ data: mockBlob });

      const result = await documentService.downloadDocument(1);

      expect(mockApi.get).toHaveBeenCalledWith('/documents/1/download', {
        responseType: 'blob',
      });
      expect(result).toEqual(mockBlob);
    });

    it('should handle download permission error', async () => {
      const permissionError = {
        response: {
          data: { message: 'No permission to download' },
          status: 403,
        },
      };
      mockApi.get.mockRejectedValue(permissionError);

      await expect(documentService.downloadDocument(1)).rejects.toThrow('No permission to download');
    });
  });

  describe('getDocumentStats', () => {
    const mockStats = {
      totalDocuments: 150,
      publishedDocuments: 120,
      draftDocuments: 30,
      categoryCounts: {
        Academic: 80,
        Administrative: 40,
        Research: 30,
      },
    };

    it('should fetch document statistics successfully', async () => {
      mockApi.get.mockResolvedValue({ data: mockStats });

      const result = await documentService.getDocumentStats();

      expect(mockApi.get).toHaveBeenCalledWith('/documents/stats');
      expect(result).toEqual(mockStats);
    });

    it('should handle stats fetch error', async () => {
      const error = new Error('Failed to fetch stats');
      mockApi.get.mockRejectedValue(error);

      await expect(documentService.getDocumentStats()).rejects.toThrow('Failed to fetch stats');
    });
  });

  describe('searchDocuments', () => {
    const mockSearchResults = {
      documents: [
        { id: 1, title: 'Search Result 1', relevance: 0.95 },
        { id: 2, title: 'Search Result 2', relevance: 0.87 },
      ],
      total: 2,
      query: 'test search',
    };

    it('should search documents successfully', async () => {
      mockApi.get.mockResolvedValue({ data: mockSearchResults });

      const result = await documentService.searchDocuments('test search');

      expect(mockApi.get).toHaveBeenCalledWith('/documents/search', {
        params: { q: 'test search' },
      });
      expect(result).toEqual(mockSearchResults);
    });

    it('should handle empty search results', async () => {
      const emptyResults = {
        documents: [],
        total: 0,
        query: 'nonexistent',
      };
      mockApi.get.mockResolvedValue({ data: emptyResults });

      const result = await documentService.searchDocuments('nonexistent');

      expect(result.documents).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('getRecentDocuments', () => {
    const mockRecentDocuments = [
      { id: 1, title: 'Recent Doc 1', updated_at: '2024-01-03' },
      { id: 2, title: 'Recent Doc 2', updated_at: '2024-01-02' },
    ];

    it('should fetch recent documents successfully', async () => {
      mockApi.get.mockResolvedValue({ data: { documents: mockRecentDocuments } });

      const result = await documentService.getRecentDocuments(5);

      expect(mockApi.get).toHaveBeenCalledWith('/documents/recent', {
        params: { limit: 5 },
      });
      expect(result).toEqual(mockRecentDocuments);
    });

    it('should use default limit when not specified', async () => {
      mockApi.get.mockResolvedValue({ data: { documents: mockRecentDocuments } });

      await documentService.getRecentDocuments();

      expect(mockApi.get).toHaveBeenCalledWith('/documents/recent', {
        params: { limit: 10 },
      });
    });
  });
});