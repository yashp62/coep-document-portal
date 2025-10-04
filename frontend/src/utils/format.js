import { format, formatDistanceToNow, parseISO } from 'date-fns'

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return 'N/A'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch (error) {
    return 'Invalid Date'
  }
}

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM dd, yyyy HH:mm')
}

export const formatRelativeTime = (date) => {
  if (!date) return 'N/A'
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    return 'Invalid Date'
  }
}

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatRole = (role) => {
  const roleMap = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    'sub-admin': 'Sub Admin',
    director: 'Director', // Legacy compatibility
    board_director: 'Board Director', // Legacy compatibility
    committee_director: 'Committee Director' // Legacy compatibility
  }
  
  return roleMap[role] || role?.replace('_', ' ').replace('-', ' ')
}

export const getRoleBadgeColor = (role) => {
  const colorMap = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    'sub-admin': 'bg-green-100 text-green-800',
    director: 'bg-blue-100 text-blue-800', // Legacy compatibility
    board_director: 'bg-blue-100 text-blue-800', // Legacy compatibility
    committee_director: 'bg-green-100 text-green-800' // Legacy compatibility
  }
  
  return colorMap[role] || 'bg-gray-100 text-gray-800'
}

export const truncateText = (text, maxLength = 100) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
