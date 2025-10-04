import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { documentService } from '../../services/documentService'
import { publicApiService } from '../../services/publicApiService'
import toast from 'react-hot-toast'

// Async thunks
export const fetchDocuments = createAsyncThunk(
  'documents/fetchDocuments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await documentService.getDocuments(params)
      // Backend returns { success: true, data: { documents: [...], pagination: {...} } }
      // documentService.getDocuments returns response.data (the full API response)
      // So response is already { success: true, data: { documents: [...], pagination: {...} } }
      return response
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch documents'
      return rejectWithValue(message)
    }
  }
)

// Public documents fetch (for public dashboard)
export const fetchPublicDocuments = createAsyncThunk(
  'documents/fetchPublicDocuments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await publicApiService.getPublicDocuments(params)
      // publicApiService.getPublicDocuments returns response.data (the full API response)
      // So response is already { success: true, data: { documents: [...], pagination: {...} } }
      return response
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch documents'
      return rejectWithValue(message)
    }
  }
)

export const fetchDocument = createAsyncThunk(
  'documents/fetchDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentService.getDocument(id)
      return response.data.document
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch document'
      return rejectWithValue(message)
    }
  }
)

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await documentService.uploadDocument(formData)
      toast.success('Document uploaded successfully!')
      return response.data.document
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload document'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const updateDocument = createAsyncThunk(
  'documents/updateDocument',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await documentService.updateDocument(id, data)
      toast.success('Document updated successfully!')
      return response.data.document
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update document'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (id, { rejectWithValue }) => {
    try {
      await documentService.deleteDocument(id)
      toast.success('Document deleted successfully!')
      return id
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete document'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const fetchMyDocuments = createAsyncThunk(
  'documents/fetchMyDocuments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await documentService.getMyDocuments(params)
      return response
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch your documents'
      return rejectWithValue(message)
    }
  }
)

export const fetchAllDocumentsAdmin = createAsyncThunk(
  'documents/fetchAllDocumentsAdmin',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await documentService.getAllDocumentsAdmin(params)
      return response
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch admin documents'
      return rejectWithValue(message)
    }
  }
)

export const downloadDocument = createAsyncThunk(
  'documents/downloadDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentService.downloadDocument(id)
      
      // Create blob and download
      const blob = new Blob([response.data])
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      
      // Get filename from response headers or use default
      const contentDisposition = response.headers['content-disposition']
      let filename = 'document'
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }
      
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
      toast.success('Document downloaded successfully!')
      return { id, success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to download document'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const fetchPendingDocuments = createAsyncThunk(
  'documents/fetchPendingDocuments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await documentService.getPendingDocuments(params)
      return response
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch pending documents'
      return rejectWithValue(message)
    }
  }
)

export const approveDocument = createAsyncThunk(
  'documents/approveDocument',
  async (id, { rejectWithValue }) => {
    try {
      const response = await documentService.approveDocument(id)
      toast.success('Document approved successfully!')
      return { id, response: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve document'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const rejectDocument = createAsyncThunk(
  'documents/rejectDocument',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await documentService.rejectDocument(id, reason)
      toast.success('Document rejected')
      return { id, reason, response: response.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject document'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Initial state
const initialState = {
  documents: [],
  myDocuments: [],
  pendingDocuments: [],
  currentDocument: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalDocuments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  myDocumentsPagination: {
    currentPage: 1,
    totalPages: 0,
    totalDocuments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  pendingDocumentsPagination: {
    currentPage: 1,
    totalPages: 0,
    totalDocuments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  isUploading: false,
  error: null,
  searchParams: {
    search: '',
    sort_by: 'created_at',
    sort_order: 'DESC',
  },
}

// Document slice
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null
    },
    setSearchParams: (state, action) => {
      state.searchParams = { ...state.searchParams, ...action.payload }
    },
    clearSearchParams: (state) => {
      state.searchParams = {
        search: '',
        sort_by: 'created_at',
        sort_order: 'DESC',
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Documents
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        // Backend returns { success: true, data: { documents: [...], pagination: {...} } }
        // action.payload is the response.data from documentService
        state.documents = action.payload.data.documents
        state.pagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Public Documents
      .addCase(fetchPublicDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPublicDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        // Backend returns { success: true, data: { documents: [...], pagination: {...} } }
        // action.payload is the response.data from documentService
        state.documents = action.payload.data.documents
        state.pagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchPublicDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Document
      .addCase(fetchDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDocument.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentDocument = action.payload
        state.error = null
      })
      .addCase(fetchDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Upload Document
      .addCase(uploadDocument.pending, (state) => {
        state.isUploading = true
        state.error = null
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.isUploading = false
        state.documents.unshift(action.payload)
        state.error = null
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.isUploading = false
        state.error = action.payload
      })
      
      // Update Document
      .addCase(updateDocument.fulfilled, (state, action) => {
        const index = state.documents.findIndex(doc => doc.id === action.payload.id)
        if (index !== -1) {
          state.documents[index] = action.payload
        }
        
        const myIndex = state.myDocuments.findIndex(doc => doc.id === action.payload.id)
        if (myIndex !== -1) {
          state.myDocuments[myIndex] = action.payload
        }
        
        if (state.currentDocument && state.currentDocument.id === action.payload.id) {
          state.currentDocument = action.payload
        }
      })
      
      // Delete Document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(doc => doc.id !== action.payload)
        state.myDocuments = state.myDocuments.filter(doc => doc.id !== action.payload)
        
        if (state.currentDocument && state.currentDocument.id === action.payload) {
          state.currentDocument = null
        }
      })
      
      // Fetch My Documents
      .addCase(fetchMyDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        // Backend returns { success: true, data: { documents: [...], pagination: {...} } }
        state.myDocuments = action.payload.data.documents
        state.myDocumentsPagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchMyDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch All Documents Admin
      .addCase(fetchAllDocumentsAdmin.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchAllDocumentsAdmin.fulfilled, (state, action) => {
        state.isLoading = false
        // Backend returns { success: true, data: { documents: [...], pagination: {...} } }
        state.documents = action.payload.data.documents
        state.pagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchAllDocumentsAdmin.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch Pending Documents
      .addCase(fetchPendingDocuments.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchPendingDocuments.fulfilled, (state, action) => {
        state.isLoading = false
        state.pendingDocuments = action.payload.data.documents
        state.pendingDocumentsPagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchPendingDocuments.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Approve Document
      .addCase(approveDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(approveDocument.fulfilled, (state, action) => {
        state.isLoading = false
        // Remove approved document from pending list
        state.pendingDocuments = state.pendingDocuments.filter(
          doc => doc.id !== action.payload.id
        )
        state.error = null
      })
      .addCase(approveDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Reject Document
      .addCase(rejectDocument.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(rejectDocument.fulfilled, (state, action) => {
        state.isLoading = false
        // Remove rejected document from pending list
        state.pendingDocuments = state.pendingDocuments.filter(
          doc => doc.id !== action.payload.id
        )
        state.error = null
      })
      .addCase(rejectDocument.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  },
})

export const { 
  clearError, 
  clearCurrentDocument, 
  setSearchParams, 
  clearSearchParams 
} = documentSlice.actions
export default documentSlice.reducer
