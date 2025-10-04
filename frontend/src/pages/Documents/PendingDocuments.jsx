import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPendingDocuments, approveDocument, rejectDocument } from '../../store/slices/documentSlice'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { 
  Search, 
  FileText, 
  Calendar,
  User,
  Check,
  X,
  Eye,
  AlertCircle
} from 'lucide-react'
import { formatDate, formatFileSize, truncateText } from '../../utils/format'

const PendingDocuments = () => {
  const dispatch = useDispatch()
  const { pendingDocuments, pendingDocumentsPagination, isLoading, error } = useSelector((state) => state.documents)
  const { user } = useSelector((state) => state.auth)

  const [localSearch, setLocalSearch] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedDocumentId, setSelectedDocumentId] = useState(null)

  useEffect(() => {
    dispatch(fetchPendingDocuments())
  }, [dispatch])

  const handleSearch = () => {
    dispatch(fetchPendingDocuments({ search: localSearch }))
  }

  const handleApprove = (documentId) => {
    dispatch(approveDocument(documentId)).then((result) => {
      if (result.type === 'documents/approveDocument/fulfilled') {
        // Refresh the pending documents list
        dispatch(fetchPendingDocuments())
      }
    })
  }

  const handleRejectClick = (documentId) => {
    setSelectedDocumentId(documentId)
    setShowRejectModal(true)
  }

  const handleReject = () => {
    if (selectedDocumentId && rejectReason.trim()) {
      dispatch(rejectDocument({ id: selectedDocumentId, reason: rejectReason })).then((result) => {
        if (result.type === 'documents/rejectDocument/fulfilled') {
          // Refresh the pending documents list
          dispatch(fetchPendingDocuments())
          setShowRejectModal(false)
          setRejectReason('')
          setSelectedDocumentId(null)
        }
      })
    }
  }

  const handlePageChange = (page) => {
    dispatch(fetchPendingDocuments({ page }))
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Documents</h1>
          <p className="text-sm text-gray-600 mt-1">
            Documents waiting for your approval from sub-admins in your university body
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search pending documents..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Documents</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !error && pendingDocuments.length === 0 && (
        <Card>
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Documents</h3>
            <p className="text-gray-600">
              There are no documents waiting for approval at this time.
            </p>
          </div>
        </Card>
      )}

      {/* Documents Grid */}
      {pendingDocuments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-500 mr-3" />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {truncateText(document.title, 30)}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                  </div>
                </div>

                {document.description && (
                  <p className="text-gray-600 text-sm mb-4">
                    {truncateText(document.description, 100)}
                  </p>
                )}

                <div className="space-y-2 text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>
                      Uploaded by {document.uploadedBy?.first_name} {document.uploadedBy?.last_name}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{formatDate(document.created_at)}</span>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    <span>{formatFileSize(document.file_size)}</span>
                  </div>
                  {document.universityBody && (
                    <div className="flex items-center">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {document.universityBody.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleApprove(document.id)}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRejectClick(document.id)}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pendingDocumentsPagination.totalPages > 1 && (
        <Card>
          <div className="flex items-center justify-between px-6 py-4">
            <div className="text-sm text-gray-700">
              Showing {pendingDocuments.length} of {pendingDocumentsPagination.totalDocuments} documents
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pendingDocumentsPagination.currentPage - 1)}
                disabled={!pendingDocumentsPagination.hasPrevPage}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-600">
                Page {pendingDocumentsPagination.currentPage} of {pendingDocumentsPagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pendingDocumentsPagination.currentPage + 1)}
                disabled={!pendingDocumentsPagination.hasNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Document</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this document:
            </p>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="4"
              placeholder="Enter rejection reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason('')
                  setSelectedDocumentId(null)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleReject}
                disabled={!rejectReason.trim()}
              >
                Reject Document
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PendingDocuments