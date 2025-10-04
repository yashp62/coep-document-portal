import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { categoryService } from '../../services/categoryService'

// Async thunks for category operations
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategories(params)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const fetchCategoryById = createAsyncThunk(
  'categories/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await categoryService.getCategory(id)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (categoryData, { rejectWithValue }) => {
    try {
      const response = await categoryService.createCategory(categoryData)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await categoryService.updateCategory(id, data)
      return response
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { rejectWithValue }) => {
    try {
      await categoryService.deleteCategory(id)
      return id
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message)
    }
  }
)

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    currentCategory: null,
    isLoading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalCategories: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  },
  reducers: {
    clearCurrentCategory: (state) => {
      state.currentCategory = null
    },
    clearCategoryError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false
        state.categories = action.payload.data?.universityBodies || action.payload.data || []
        state.pagination = action.payload.data?.pagination || state.pagination
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCategory = action.payload.data || action.payload
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const newCategory = action.payload.data || action.payload
        state.categories.unshift(newCategory)
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Update category
      .addCase(updateCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const updatedCategory = action.payload.data || action.payload
        const index = state.categories.findIndex(cat => cat.id === updatedCategory.id)
        if (index !== -1) {
          state.categories[index] = updatedCategory
        }
        if (state.currentCategory?.id === updatedCategory.id) {
          state.currentCategory = updatedCategory
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Delete category
      .addCase(deleteCategory.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.isLoading = false
        const deletedId = action.payload
        state.categories = state.categories.filter(cat => cat.id !== deletedId)
        if (state.currentCategory?.id === deletedId) {
          state.currentCategory = null
        }
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
  }
})

export const { clearCurrentCategory, clearCategoryError } = categorySlice.actions
export default categorySlice.reducer