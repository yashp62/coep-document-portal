import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../../store/slices/authSlice';

// Mock store factory
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      auth: authSlice,
    },
    preloadedState: {
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        ...initialState.auth,
      },
    },
  });
};

// Render with providers wrapper
export const renderWithProviders = (
  ui,
  {
    preloadedState = {},
    store = createMockStore(preloadedState),
    ...renderOptions
  } = {}
) => {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

// Mock user data
export const mockUser = {
  id: 1,
  email: 'test@example.com',
  role: 'director',
  first_name: 'Test',
  last_name: 'User',
  designation: 'Test Director',
  is_active: true,
};

export const mockSuperAdmin = {
  id: 2,
  email: 'admin@example.com',
  role: 'super_admin',
  first_name: 'Admin',
  last_name: 'User',
  designation: 'System Administrator',
  is_active: true,
};

// Mock API responses
export const mockApiResponse = (data, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error occurred',
});

// Mock document data
export const mockDocument = {
  id: 1,
  title: 'Test Document',
  description: 'Test document description',
  file_name: 'test.pdf',
  file_size: 1024000,
  uploaded_by: mockUser.id,
  university_body_id: 1,
  created_at: '2023-01-01T00:00:00.000Z',
  updated_at: '2023-01-01T00:00:00.000Z',
  uploader: mockUser,
  universityBody: {
    id: 1,
    name: 'Academic Council',
    type: 'council',
  },
};

// Mock university body data
export const mockUniversityBody = {
  id: 1,
  name: 'Academic Council',
  type: 'council',
  description: 'Academic decision making body',
  director_id: mockUser.id,
  is_active: true,
  created_at: '2023-01-01T00:00:00.000Z',
  director: mockUser,
};

// Wait for async operations
export const waitForLoadingToFinish = () => 
  waitFor(() => expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument());

// Mock fetch responses
export const mockFetch = (response, ok = true) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok,
      status: ok ? 200 : 400,
      json: () => Promise.resolve(response),
      headers: new Headers(),
    })
  );
};

// Mock local storage
export const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => { store[key] = value; },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock file operations
export const mockFile = (name = 'test.pdf', size = 1024, type = 'application/pdf') => {
  return new File(['content'], name, { type, size });
};

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');
global.URL.revokeObjectURL = jest.fn();