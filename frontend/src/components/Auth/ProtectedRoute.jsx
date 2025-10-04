import { Navigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LoadingSpinner from '../UI/LoadingSpinner'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth)
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (allowedRoles.length > 0) {
    const hasAllowedRole = allowedRoles.includes(user?.role)
    if (!hasAllowedRole) {
      // Redirect to appropriate dashboard based on user role
      if (user?.role === 'super_admin' || user?.role === 'admin') {
        return <Navigate to="/admin/dashboard" replace />
      } else if (user?.role === 'sub_admin') {
        return <Navigate to="/dashboard" replace />
      } else {
        return <Navigate to="/dashboard" replace />
      }
    }
  }

  return children
}

export default ProtectedRoute
