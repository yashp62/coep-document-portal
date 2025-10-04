import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { updateUser } from '../../store/slices/authSlice'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import { User, Mail, Shield, Calendar } from 'lucide-react'
import { formatDate, formatRole, getRoleBadgeColor } from '../../utils/format'

const Profile = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)
  const [isEditing, setIsEditing] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      email: user?.email || ''
    }
  })

  const onSubmit = async (data) => {
    try {
      await dispatch(updateUser(data))
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account information
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  Profile Information
                </h3>
                {!isEditing && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input
                      label="Email Address"
                      type="email"
                      error={errors.email?.message}
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button type="submit" loading={isLoading}>
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Name</p>
                      <p className="text-sm text-gray-900">
                        {user?.first_name} {user?.last_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                  {user?.universityBody && (
                    <div className="flex items-center space-x-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">University Body</p>
                        <p className="text-sm text-gray-900">{user.universityBody.name}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user?.role)}`}>
                        {formatRole(user?.role)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-500">Member Since</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(user?.created_at)}
                      </p>
                    </div>
                  </div>
                  {user?.last_login && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Last Login</p>
                        <p className="text-sm text-gray-900">
                          {formatDate(user.last_login)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Profile Summary */}
        <div>
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Account Summary</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user?.email?.split('@')[0]}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatRole(user?.role)}
                    </p>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-sm text-gray-500">
                    <p>Account Status: <span className="text-green-600 font-medium">Active</span></p>
                    <p className="mt-1">Member since: {formatDate(user?.created_at)}</p>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card className="mt-6">
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-2">
                <Button
                  variant="secondary"
                  className="w-full justify-start"
                  as="a"
                  href="/admin/documents"
                >
                  Browse Documents
                </Button>
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    as="a"
                    href="/admin/documents/upload"
                  >
                    Upload Document
                  </Button>
                )}
                {user?.role === 'super_admin' && (
                  <Button
                    variant="secondary"
                    className="w-full justify-start"
                    as="a"
                    href="/admin/users"
                  >
                    Manage Users
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Profile
