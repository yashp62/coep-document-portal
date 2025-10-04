import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { universityBodyService } from '../../services/universityBodyService'
import toast from 'react-hot-toast'

const EditUniversityBody = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm()

  const bodyType = watch('type')

  useEffect(() => {
    const fetchUniversityBody = async () => {
      try {
        const response = await universityBodyService.getUniversityBodyById(id)
        const body = response.data.universityBody
        
        // Set form values
        setValue('name', body.name)
        setValue('type', body.type)
        setValue('description', body.description || '')
        setValue('director_id', body.director_id || '')
        setValue('is_active', body.is_active)
      } catch (error) {
        console.error('Failed to fetch university body:', error)
        toast.error('Failed to load university body data')
        navigate('/admin/university-bodies')
      } finally {
        setIsLoadingData(false)
      }
    }

    if (id) {
      fetchUniversityBody()
    }
  }, [id, setValue, navigate])

  const onSubmit = async (data) => {
    setIsLoading(true)
    
    try {
      await universityBodyService.updateUniversityBody(id, data)
      toast.success(`${data.type} updated successfully!`)
      navigate('/admin/university-bodies')
    } catch (error) {
      console.error('Failed to update university body:', error)
      toast.error('Failed to update university body')
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
        <h1 className="text-2xl font-bold text-gray-900">Edit University Body</h1>
        <p className="text-gray-600">Update university body information</p>
      </div>

      <Card>
        <Card.Body>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Enter university body name"
                {...register('name', { 
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' }
                })}
                error={errors.name?.message}
              />
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                id="type"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register('type', { required: 'Type is required' })}
              >
                <option value="">Select type</option>
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

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter description..."
                {...register('description')}
              />
            </div>

            {/* Director ID */}
            <div>
              <label htmlFor="director_id" className="block text-sm font-medium text-gray-700 mb-1">
                Director ID
              </label>
              <Input
                id="director_id"
                type="number"
                placeholder="Enter director user ID (optional)"
                {...register('director_id', {
                  valueAsNumber: true,
                  validate: value => !value || value > 0 || 'Director ID must be a positive number'
                })}
                error={errors.director_id?.message}
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave empty if no director is assigned
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  {...register('is_active')}
                />
                <span className="ml-2 text-sm text-gray-700">Active</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/admin/university-bodies')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Update'}
              </Button>
            </div>
          </form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default EditUniversityBody