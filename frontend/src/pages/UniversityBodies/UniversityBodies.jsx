import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { universityBodyService } from '../../services/universityBodyService'
import { 
  Plus,
  Edit,
  Trash2,
  Building2,
  Users,
  Search,
  Filter
} from 'lucide-react'

const UniversityBodies = () => {
  const { user } = useSelector((state) => state.auth)
  const [universityBodies, setUniversityBodies] = useState([])
  const [filteredBodies, setFilteredBodies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  const fetchUniversityBodies = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await universityBodyService.getAllUniversityBodies({ limit: 1000 })
      const bodies = response.data.universityBodies || []
      setUniversityBodies(bodies)
      setFilteredBodies(bodies)
    } catch (error) {
      console.error('Failed to fetch university bodies:', error)
      setError('Failed to load university bodies')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUniversityBodies()
  }, [])

  // Filter university bodies based on search term and type
  useEffect(() => {
    let filtered = universityBodies

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(body => 
        body.type.toLowerCase() === filterType.toLowerCase()
      )
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(body =>
        body.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (body.description && body.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (body.director?.first_name && `${body.director.first_name} ${body.director.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    setFilteredBodies(filtered)
  }, [universityBodies, searchTerm, filterType])

  // Separate bodies by type for display
  const boards = filteredBodies.filter(body => body.type === 'Board')
  const committees = filteredBodies.filter(body => body.type === 'Committee')
  const others = filteredBodies.filter(body => !['Board', 'Committee'].includes(body.type))

  const handleDelete = async (id, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type.toLowerCase()}?`)) {
      try {
        await universityBodyService.deleteUniversityBody(id)
        // Refresh the list
        fetchUniversityBodies()
      } catch (error) {
        console.error(`Failed to delete ${type}:`, error)
        alert(`Failed to delete ${type.toLowerCase()}`)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUniversityBodies}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const allBodies = [...boards, ...committees, ...others]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">University Bodies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage boards, committees, and other university bodies
          </p>
        </div>
        {user?.role === 'super_admin' && (
          <Button as={Link} to="/admin/university-bodies/create">
            <Plus className="h-4 w-4 mr-2" />
            Add New Body
          </Button>
        )}
      </div>

      {/* Search and Filters */}
      <Card>
        <Card.Body>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, description, or director..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="board">Board</option>
                <option value="committee">Committee</option>
                <option value="council">Council</option>
                <option value="department">Department</option>
                <option value="office">Office</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* University Bodies List */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-medium text-gray-900">
            University Bodies ({filteredBodies.length})
          </h2>
        </Card.Header>
        <Card.Header>
          <h3 className="text-lg font-medium text-gray-900">All University Bodies</h3>
        </Card.Header>
        <Card.Body>
          {allBodies.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Director
                    </th>
                    {user?.role === 'super_admin' && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allBodies.map((body) => (
                    <tr key={`${body.type}-${body.id}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {body.type === 'Board' ? (
                            <Building2 className="h-5 w-5 text-blue-500 mr-3" />
                          ) : body.type === 'Committee' ? (
                            <Users className="h-5 w-5 text-green-500 mr-3" />
                          ) : (
                            <Building2 className="h-5 w-5 text-purple-500 mr-3" />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {body.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          body.type === 'Board' ? 'bg-blue-100 text-blue-800' : 
                          body.type === 'Committee' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {body.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {body.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {body.director ? `${body.director.first_name} ${body.director.last_name}` : 'Not assigned'}
                      </td>
                      {user?.role === 'super_admin' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              as={Link}
                              to={`/admin/university-bodies/${body.id}/edit`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(body.id, body.type)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No university bodies</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new board or committee.</p>
              {user?.role === 'super_admin' && (
                <div className="mt-6">
                  <Button as={Link} to="/admin/university-bodies/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Body
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  )
}

export default UniversityBodies