import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import { universityBodyService } from '../../services/universityBodyService'
import { userService } from '../../services/userService'
import toast from 'react-hot-toast'

const CreateUniversityBody = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [directors, setDirectors] = useState([])
  const [directorsLoading, setDirectorsLoading] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm()

  const bodyType = watch('type')

  useEffect(() => {
    fetchDirectors()
  }, [])

  const fetchDirectors = async () => {
    try {
      const response = await userService.getUsers({ role: 'director' })
      setDirectors(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch directors:', error)
      setDirectors([])
    } finally {
      setDirectorsLoading(false)
    }
  }

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      await universityBodyService.createUniversityBody(data)
      toast.success(`${data.type} created successfully!`)
      navigate('/admin/university-bodies')
    } catch (error) {
      console.error('Failed to create university body:', error)
      toast.error('Failed to create university body')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create University Body</h1>
        <p className="text-gray-600">Add a new board, committee, or other university body</p>
      </div>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Body Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Type *
              </label>
              <select
                {...register('type', { required: 'Body type is required' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select body type</option>
                <option value="Board">Board</option>
                <option value="Committee">Committee</option>
                <option value="Council">Council</option>
                <option value="Department">Department</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Name */}
            <Input
              label="Name"
              {...register('name', { 
                required: 'Name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' }
              })}
              error={errors.name?.message}
              placeholder={`Enter ${bodyType || 'body'} name`}
            />

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={`Enter ${bodyType || 'body'} description`}
              />
            </div>

            {/* Director Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Director (Optional)
              </label>
              <select
                {...register('director_id')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={directorsLoading}
              >
                <option value="">
                  {directorsLoading ? 'Loading directors...' : 'Select director'}
                </option>
                {directors.map((director) => (
                  <option key={director.id} value={director.id}>
                    {director.first_name && director.last_name 
                      ? `${director.first_name} ${director.last_name}`
                      : director.email
                    }
                    {director.designation && ` - ${director.designation}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Display Order */}
            <Input
              label="Display Order"
              type="number"
              {...register('display_order', { 
                min: { value: 0, message: 'Display order must be 0 or greater' }
              })}
              error={errors.display_order?.message}
              placeholder="0"
              defaultValue="0"
            />

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_active')}
                defaultChecked={true}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : `Create ${bodyType || 'Body'}`}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/university-bodies')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default CreateUniversityBody