import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { verifyToken } from './store/slices/authSlice'
import { authService } from './services/authService'

// Components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Pages
import Login from './pages/Auth/Login'
import PublicDashboard from './pages/PublicDashboard/PublicDashboard'
import Dashboard from './pages/Dashboard/Dashboard'
import Documents from './pages/Documents/Documents'
import DocumentDetail from './pages/Documents/DocumentDetail'
import UploadDocument from './pages/Documents/UploadDocument'
import EditDocument from './pages/Documents/EditDocument'
import MyDocuments from './pages/Documents/MyDocuments'
import PendingDocuments from './pages/Documents/PendingDocuments'
import Users from './pages/Users/Users'
import Profile from './pages/Profile/Profile'
import UniversityBodies from './pages/UniversityBodies/UniversityBodies'
import CreateUniversityBody from './pages/UniversityBodies/CreateUniversityBody'
import EditUniversityBody from './pages/UniversityBodies/EditUniversityBody'
import NotFound from './pages/NotFound/NotFound'

function App() {
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth)

  useEffect(() => {
    // Check if user is authenticated on app load
    if (authService.isAuthenticated()) {
      const token = authService.getToken()
      if (token) {
        dispatch(verifyToken(token))
      }
    }
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicDashboard />} />
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            user?.role === 'super_admin' ? <Navigate to="/admin/dashboard" replace /> :
            user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> :
            user?.role === 'sub_admin' ? <Navigate to="/dashboard" replace /> :
            <Navigate to="/dashboard" replace />
          ) : <Login />
        } 
      />

      {/* Protected Routes with Layout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Shared Dashboard Route (accessible to all authenticated users) */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Profile Route (accessible to super_admin and admin only) */}
        <Route 
          path="profile" 
          element={
            user?.role === 'super_admin' || user?.role === 'admin' ? 
            <Profile /> : 
            <Navigate to="/dashboard" replace />
          } 
        />
      </Route>

      {/* Super Admin and Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        {/* Documents */}
        <Route path="documents" element={<Documents />} />
        <Route path="documents/pending" element={<PendingDocuments />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="documents/upload" element={<UploadDocument />} />
        <Route path="documents/:id/edit" element={<EditDocument />} />
        <Route path="my-documents" element={<MyDocuments />} />

        {/* Super Admin Only Routes */}
        <Route 
          path="users" 
          element={
            user?.role === 'super_admin' ? 
            <Users /> : 
            <Navigate to="/admin/dashboard" replace />
          } 
        />
        <Route 
          path="university-bodies" 
          element={
            user?.role === 'super_admin' ? 
            <UniversityBodies /> : 
            <Navigate to="/admin/dashboard" replace />
          } 
        />
        <Route 
          path="university-bodies/create" 
          element={
            user?.role === 'super_admin' ? 
            <CreateUniversityBody /> : 
            <Navigate to="/admin/dashboard" replace />
          } 
        />
        <Route 
          path="university-bodies/:id/edit" 
          element={
            user?.role === 'super_admin' ? 
            <EditUniversityBody /> : 
            <Navigate to="/admin/dashboard" replace />
          } 
        />
      </Route>

      {/* Sub-Admin Routes */}
      <Route
        path="/sub-admin"
        element={
          <ProtectedRoute allowedRoles={['sub_admin']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="my-documents" element={<MyDocuments />} />
        <Route path="documents/upload" element={<UploadDocument />} />
        <Route path="documents/:id" element={<DocumentDetail />} />
        <Route path="documents/:id/edit" element={<EditDocument />} />
      </Route>

      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
