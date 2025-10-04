import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { fetchDocuments, fetchAllDocumentsAdmin, downloadDocument, setSearchParams } from '../../store/slices/documentSlice'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import EmptyState from '../../components/UI/EmptyState'
import { 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Calendar,
  User,
  FolderOpen,
  Eye,
  X,
  SortAsc,
  SortDesc,
  Upload
} from 'lucide-react'
import { formatDate, formatFileSize, truncateText } from '../../utils/format'

const Documents = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { documents, pagination, isLoading, searchParams } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth)

  // Check if we're in admin mode
  const isAdminMode = location.pathname.startsWith('/admin/')

  const [localSearch, setLocalSearch] = useState(searchParams.search || '')
  const [sortBy, setSortBy] = useState(searchParams.sort_by || 'created_at')
  const [sortOrder, setSortOrder] = useState(searchParams.sort_order || 'DESC')
  const [filtersVisible, setFiltersVisible] = useState(false)

  useEffect(() => {
    // Use admin endpoint if in admin mode and user has appropriate role
    if (isAdminMode && (user?.role === 'admin' || user?.role === 'sub_admin' || user?.role === 'super_admin')) {
      dispatch(fetchAllDocumentsAdmin(searchParams))
    } else {
      dispatch(fetchDocuments(searchParams))
    }
  }, [dispatch, searchParams, isAdminMode, user?.role])

  const handleSearch = () => {
    const newParams = {
      ...searchParams,
      search: localSearch,
      sort_by: sortBy,
      sort_order: sortOrder,
      page: 1
    }
    dispatch(setSearchParams(newParams))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // Handle sort changes without affecting search
  const handleSortChange = (newSortBy, newSortOrder) => {
    setSortBy(newSortBy)
    setSortOrder(newSortOrder)
    const newParams = {
      ...searchParams,
      search: localSearch,
      sort_by: newSortBy,
      sort_order: newSortOrder,
      page: 1
    }
    dispatch(setSearchParams(newParams))
  }

  const handleSortByChange = (newSortBy) => {
    handleSortChange(newSortBy, sortOrder)
  }

  const handleSortOrderChange = (newSortOrder) => {
    handleSortChange(sortBy, newSortOrder)
  }

  const handleDownload = async (documentId) => {
    await dispatch(downloadDocument(documentId))
  }

  const handlePreview = (documentId) => {
    // Open document preview in new tab
    const previewUrl = `/api/documents/${documentId}/preview`
    window.open(previewUrl, '_blank')
  }

  const handlePageChange = (page) => {
    const newParams = { ...searchParams, page }
    dispatch(setSearchParams(newParams))
  }

  const clearFilters = () => {
    setLocalSearch('')
    handleSortChange('created_at', 'DESC')
  }

  const hasActiveFilters = localSearch || sortBy !== 'created_at' || sortOrder !== 'DESC'
  const canUpload = user?.role === 'director' || user?.role === 'super_admin'

  const handleUpload = () => {
    navigate('/admin/documents/upload')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isAdminMode ? 'All Documents' : 'Documents'}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isAdminMode 
              ? 'Manage all university documents (public and private)' 
              : 'Browse and manage university documents'
            }
          </p>
        </div>
        {canUpload && (
          <Button as={Link} to="/admin/documents/upload" className="shrink-0">
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card className="shadow-sm">
        <Card.Body className="pb-4">
          {/* Main Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search documents by title or description..."
                  className="block w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {localSearch && (
                  <button
                    onClick={() => setLocalSearch('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 shrink-0">
              <Button onClick={handleSearch} className="px-6">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={() => setFiltersVisible(!filtersVisible)}
                className={hasActiveFilters ? 'ring-2 ring-blue-200 bg-blue-50' : ''}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {filtersVisible && (
            <div className="pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => handleSortByChange(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="created_at">Date Created</option>
                    <option value="title">Title</option>
                    <option value="download_count">Downloads</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) => handleSortOrderChange(e.target.value)}
                    className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DESC">
                      {sortBy === 'title' ? 'Z to A' : 'Newest First'}
                    </option>
                    <option value="ASC">
                      {sortBy === 'title' ? 'A to Z' : 'Oldest First'}
                    </option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="secondary" 
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Documents List */}
      <Card className="shadow-sm">
        <Card.Header className="border-b bg-gray-50/50">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              Documents {pagination.totalDocuments > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({pagination.totalDocuments} total)
                </span>
              )}
            </h3>
            {hasActiveFilters && (
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Filtered results
              </span>
            )}
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {isLoading ? (
            <div className="p-6">
              <SkeletonLoader.DocumentGrid count={5} />
            </div>
          ) : documents && documents.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Document Info */}
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 mt-1">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <h4 className="text-lg font-medium text-gray-900 truncate">
                            {document.title}
                          </h4>
                          {/* Privacy and Approval indicators for admin mode */}
                          {isAdminMode && (
                            <>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                                document.is_public 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {document.is_public ? 'Public' : 'Private'}
                              </span>
                              {document.approval_status && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shrink-0 ${
                                  document.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                                  document.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  document.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {document.approval_status === 'approved' ? '✓ Approved' :
                                   document.approval_status === 'pending' ? '⏳ Pending' :
                                   document.approval_status === 'rejected' ? '✗ Rejected' :
                                   document.approval_status}
                                </span>
                              )}
                            </>
                          )}
                          <button
                            onClick={() => handlePreview(document.id)}
                            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors shrink-0"
                            title="Preview document"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </button>
                        </div>
                        
                        {document.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {truncateText(document.description, 150)}
                          </p>
                        )}
                        
                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>{formatDate(document.created_at)}</span>
                          </div>
                          <div className="flex items-center">
                            <User className="h-3 w-3 mr-1" />
                            <span>{document.uploadedBy?.email}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">{formatFileSize(document.file_size)}</span>
                          </div>
                          <div className="flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            <span>{document.download_count} downloads</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownload(document.id)}
                        className="flex-1 sm:flex-none"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {user?.role === 'super_admin' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this document?')) {
                              try {
                                await import('../../services/documentService').then(m => m.documentService.deleteDocument(document.id));
                                window.location.reload();
                              } catch (err) {
                                alert('Failed to delete document');
                              }
                            }
                          }}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6">
              <EmptyState.NoDocuments
                hasFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onUpload={canUpload ? handleUpload : null}
                canUpload={canUpload}
              />
            </div>
          )}
        </Card.Body>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Card.Footer className="bg-white border-t">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600 order-2 sm:order-1">
                Showing page {pagination.currentPage} of {pagination.totalPages}
                <span className="hidden sm:inline">
                  {' '}({pagination.totalDocuments} total documents)
                </span>
              </div>
              <div className="flex justify-center sm:justify-end gap-1 order-1 sm:order-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3"
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="hidden sm:flex gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, index) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + index;
                    } else {
                      pageNum = pagination.currentPage - 2 + index;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === pagination.currentPage ? "primary" : "secondary"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3"
                >
                  Next
                </Button>
              </div>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  )
}

export default Documents
