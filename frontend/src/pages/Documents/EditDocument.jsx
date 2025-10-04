import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { documentService } from '../../services/documentService'
import { universityBodyService } from '../../services/universityBodyService'
import toast from 'react-hot-toast'

const EditDocument = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [universityBodies, setUniversityBodies] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    university_body_id: '',
    is_public: true
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch document data
        const docResponse = await documentService.getDocument(id)
        const document = docResponse.data.document
        
        // Check if user can edit this document
        if (document.uploaded_by_id !== user.id && user.role !== 'super_admin') {
          toast.error('You can only edit documents you uploaded')
          navigate('/admin/my-documents')
          return
        }

        // Fetch university bodies
        const bodiesResponse = await universityBodyService.getAllUniversityBodies()
        setUniversityBodies(bodiesResponse.data.universityBodies || [])
        
        // Set form data
        setFormData({
          title: document.title || '',
          description: document.description || '',
          university_body_id: document.university_body_id || '',
          is_public: document.is_public !== undefined ? document.is_public : true
        })
      } catch (error) {
        console.error('Failed to fetch document data:', error)
        toast.error('Failed to load document data')
        navigate('/admin/my-documents')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id, user, navigate])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      await documentService.updateDocument(id, formData)
      toast.success('Document updated successfully!')
      navigate('/admin/my-documents')
    } catch (error) {
      console.error('Failed to update document:', error)
      toast.error('Failed to update document')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Document</h1>
        <p className="text-gray-600">Update document information</p>
      </div>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <Input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter document title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description..."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* University Body */}
            <div>
              <label htmlFor="university_body_id" className="block text-sm font-medium text-gray-700 mb-1">
                University Body
              </label>
              <select
                id="university_body_id"
                name="university_body_id"
                value={formData.university_body_id}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select University Body (Optional)</option>
                {universityBodies.map((body) => (
                  <option key={body.id} value={body.id}>
                    {body.name} ({body.type})
                  </option>
                ))}
              </select>
            </div>

            {/* Public Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Make document publicly visible</span>
              </label>
              <p className="mt-1 text-sm text-gray-500">
                Public documents can be viewed by anyone. Private documents are only visible to logged-in users.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/my-documents')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update Document'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default EditDocument