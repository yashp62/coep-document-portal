import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import documentReducer from './slices/documentSlice'
import userReducer from './slices/userSlice'
import universityBodyReducer from './slices/universityBodySlice'
import categoryReducer from './slices/categorySlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    users: userReducer,
    universityBodies: universityBodyReducer,
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})
