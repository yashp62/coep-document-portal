import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await userService.getUsers(params)
      return response.data
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch users'
      return rejectWithValue(message)
    }
  }
)

export const fetchUser = createAsyncThunk(
  'users/fetchUser',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userService.getUser(id)
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch user'
      return rejectWithValue(message)
    }
  }
)

export const createUser = createAsyncThunk(
  'users/createUser',
  async (data, { rejectWithValue }) => {
    try {
      const response = await userService.createUser(data)
      toast.success('User created successfully!')
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create user'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, data)
      toast.success('User updated successfully!')
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await userService.deleteUser(id)
      toast.success('User deleted successfully!')
      return id
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete user'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

export const toggleUserStatus = createAsyncThunk(
  'users/toggleUserStatus',
  async (id, { rejectWithValue }) => {
    try {
      const response = await userService.toggleUserStatus(id)
      toast.success('User status updated successfully!')
      return response.data.user
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update user status'
      toast.error(message)
      return rejectWithValue(message)
    }
  }
)

// Initial state
const initialState = {
  users: [],
  currentUser: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalUsers: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  isLoading: false,
  error: null,
}

// User slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false
        // Backend returns { success: true, data: { users: [...], pagination: {...} } }
        state.users = action.payload.data.users
        state.pagination = action.payload.data.pagination
        state.error = null
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentUser = action.payload
        state.error = null
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      
      // Create User
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.unshift(action.payload)
      })
      
      // Update User
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload
        }
      })
      
      // Delete User
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(user => user.id !== action.payload)
        
        if (state.currentUser && state.currentUser.id === action.payload) {
          state.currentUser = null
        }
      })
      
      // Toggle User Status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
        
        if (state.currentUser && state.currentUser.id === action.payload.id) {
          state.currentUser = action.payload
        }
      })
  },
})

export const { clearError, clearCurrentUser } = userSlice.actions
export default userSlice.reducer
