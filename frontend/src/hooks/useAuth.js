import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../store/slices/authSlice'
import { authService } from '../services/authService'

export const useAuth = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, isAuthenticated, isLoading, error } = useSelector((state) => state.auth)

  const logout = async () => {
    await dispatch(logoutUser())
    navigate('/login')
  }

  const hasRole = (role) => {
    return user?.role === role
  }

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role)
  }

  const isAdmin = () => {
    return hasRole('admin')
  }

  const isSubAdmin = () => {
    return hasRole('sub_admin')
  }

  const isSuperAdmin = () => {
    return hasRole('super_admin')
  }

  const isAdminLevel = () => {
    return hasAnyRole(['admin', 'super_admin'])
  }

  const canManageDocuments = () => {
    return hasAnyRole(['admin', 'sub_admin', 'super_admin'])
  }

  const canManageUsers = () => {
    return hasRole('super_admin')
  }

  const canManageUniversityBodies = () => {
    return hasRole('super_admin')
  }

  const canApproveDocuments = () => {
    return hasAnyRole(['admin', 'super_admin'])
  }

  const canAccess = (requiredRoles) => {
    if (!isAuthenticated) return false
    if (!requiredRoles || requiredRoles.length === 0) return true
    return hasAnyRole(requiredRoles)
  }

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
    isSubAdmin,
    isSuperAdmin,
    isAdminLevel,
    canManageDocuments,
    canManageUsers,
    canManageUniversityBodies,
    canApproveDocuments,
    canAccess,
    // Legacy support for migration period
    isDirector: isAdminLevel,
    isBoardDirector: isAdminLevel,
    isCommitteeDirector: isAdminLevel,
  }
}
