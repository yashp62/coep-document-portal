import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPublicDocuments } from '../../store/slices/documentSlice'
import Card from '../../components/UI/Card'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { publicApiService } from '../../services/publicApiService'
import { 
  FileText, 
  FolderOpen, 
  Download, 
  Search,
  Filter,
  Building2,
  Users,
  Calendar,
  User
} from 'lucide-react'
import { formatDate, formatFileSize, truncateText } from '../../utils/format'

const PublicDashboard = () => {
  const dispatch = useDispatch()
  const { documents, isLoading: documentsLoading } = useSelector((state) => state.documents)

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUniversityBody, setSelectedUniversityBody] = useState('')
  const [universityBodies, setUniversityBodies] = useState([])
  const [universitiesLoading, setUniversitiesLoading] = useState(false)
  const [expandedDescriptions, setExpandedDescriptions] = useState({})

  const toggleDescription = (documentId) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [documentId]: !prev[documentId]
    }))
  }

  // Fetch university bodies for filter dropdown
  useEffect(() => {
    const fetchUniversityBodies = async () => {
      try {
        setUniversitiesLoading(true)
        // Fetch all university bodies by setting a high limit
        const response = await publicApiService.getPublicUniversityBodies({ page: 1, limit: 1000 })
        setUniversityBodies(response.data.universityBodies || [])
      } catch (error) {
        console.error('Error fetching university bodies:', error)
      } finally {
        setUniversitiesLoading(false)
      }
    }

    fetchUniversityBodies()
  }, [])

  useEffect(() => {
    // Fetch recent documents
    const params = {
      limit: 10,
      sort_by: 'created_at',
      sort_order: 'DESC'
    }
    
    if (searchTerm) params.search = searchTerm
    if (selectedUniversityBody) params.university_body_id = selectedUniversityBody

    dispatch(fetchPublicDocuments(params))
  }, [dispatch, searchTerm, selectedUniversityBody])

  const handleDownload = async (documentId) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        
        // Get filename from response headers
        const contentDisposition = response.headers.get('content-disposition')
        let filename = 'document'
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const handlePreview = (documentId) => {
    // Open document preview in new tab
    const previewUrl = `/api/documents/${documentId}/preview`
    window.open(previewUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-primary-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  COEP Technological University
                </h1>
                <p className="text-sm text-gray-600">
                  Official Documents Portal
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Director Login
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <Card className="mb-8 shadow-sm">
          <Card.Body className="p-6">
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Find Documents
                </h2>
                <p className="text-sm text-gray-600">
                  Search through our collection of official university documents
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search documents by title or description..."
                      className="block w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                
                <div className="w-full sm:w-64">
                  <select
                    value={selectedUniversityBody}
                    onChange={(e) => setSelectedUniversityBody(e.target.value)}
                    disabled={universitiesLoading}
                    className="block w-full px-3 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">All University Bodies</option>
                    {universityBodies.map((body) => (
                      <option key={body.id} value={body.id}>
                        {body.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {(searchTerm || selectedUniversityBody) && (
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">
                    {searchTerm && (
                      <span>Searching for "{searchTerm}"</span>
                    )}
                    {searchTerm && selectedUniversityBody && <span> • </span>}
                    {selectedUniversityBody && (
                      <span>in {universityBodies.find(b => b.id == selectedUniversityBody)?.name}</span>
                    )}
                  </span>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedUniversityBody('');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>

        {/* Documents List */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-medium text-gray-900">
              Official Documents ({documents?.length || 0})
            </h2>
          </Card.Header>
          <Card.Body>
            {documentsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <FileText className="h-8 w-8 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {document.title}
                          </h3>
                          <button
                            onClick={() => handlePreview(document.id)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                            title="Preview in new tab"
                          >
                            (Preview)
                          </button>
                        </div>
                        {document.description && (
                          <div className="text-sm text-gray-500 mt-1">
                            <p>
                              {expandedDescriptions[document.id] 
                                ? document.description 
                                : truncateText(document.description, 100)
                              }
                              {document.description.length > 100 && (
                                <button
                                  onClick={() => toggleDescription(document.id)}
                                  className="ml-1 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  {expandedDescriptions[document.id] ? 'Read less' : 'Read more'}
                                </button>
                              )}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          {document.universityBody && (
                            <div className="flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {document.universityBody.name}
                            </div>
                          )}
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {formatDate(document.created_at)}
                          </div>
                          <div>
                            {formatFileSize(document.file_size)}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <button
                        onClick={() => handleDownload(document.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No documents found matching your criteria.
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 COEP Technological University. All rights reserved.</p>
            <p className="mt-2">
              For technical support, contact: admin@coep.ac.in
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default PublicDashboard
