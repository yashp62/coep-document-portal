import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import universityBodyService from '../../services/universityBodyService';

// Async thunks
export const fetchUniversityBodies = createAsyncThunk(
  'universityBodies/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await universityBodyService.getAllUniversityBodies(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch university bodies');
    }
  }
);

export const fetchUniversityBodyById = createAsyncThunk(
  'universityBodies/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await universityBodyService.getUniversityBodyById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch university body');
    }
  }
);

export const createUniversityBody = createAsyncThunk(
  'universityBodies/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await universityBodyService.createUniversityBody(data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create university body');
    }
  }
);

export const updateUniversityBody = createAsyncThunk(
  'universityBodies/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await universityBodyService.updateUniversityBody(id, data);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update university body');
    }
  }
);

export const deleteUniversityBody = createAsyncThunk(
  'universityBodies/delete',
  async (id, { rejectWithValue }) => {
    try {
      await universityBodyService.deleteUniversityBody(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete university body');
    }
  }
);

export const searchUniversityBodies = createAsyncThunk(
  'universityBodies/search',
  async ({ query, type }, { rejectWithValue }) => {
    try {
      const response = await universityBodyService.searchUniversityBodies(query, type);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search university bodies');
    }
  }
);

const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  searchResults: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  },
  filters: {
    type: '',
    search: '',
    isActive: null
  }
};

const universityBodySlice = createSlice({
  name: 'universityBodies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all university bodies
      .addCase(fetchUniversityBodies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUniversityBodies.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        state.pagination = {
          total: action.payload.total || 0,
          page: action.payload.page || 1,
          limit: action.payload.limit || 10,
          totalPages: action.payload.totalPages || 0
        };
      })
      .addCase(fetchUniversityBodies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch university body by ID
      .addCase(fetchUniversityBodyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUniversityBodyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload.data;
      })
      .addCase(fetchUniversityBodyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create university body
      .addCase(createUniversityBody.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUniversityBody.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createUniversityBody.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update university body
      .addCase(updateUniversityBody.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUniversityBody.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id === action.payload.data.id);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        if (state.currentItem && state.currentItem.id === action.payload.data.id) {
          state.currentItem = action.payload.data;
        }
      })
      .addCase(updateUniversityBody.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete university body
      .addCase(deleteUniversityBody.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUniversityBody.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentItem && state.currentItem.id === action.payload) {
          state.currentItem = null;
        }
      })
      .addCase(deleteUniversityBody.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Search university bodies
      .addCase(searchUniversityBodies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUniversityBodies.fulfilled, (state, action) => {
        state.loading = false;
        state.searchResults = action.payload.data || [];
      })
      .addCase(searchUniversityBodies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentItem,
  setFilters,
  clearFilters,
  clearSearchResults
} = universityBodySlice.actions;

export default universityBodySlice.reducer;