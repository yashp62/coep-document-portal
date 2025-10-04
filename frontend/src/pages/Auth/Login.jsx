import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Navigate, useLocation, Link } from 'react-router-dom'
import { loginUser } from '../../store/slices/authSlice'
import Button from '../../components/UI/Button'
import Input from '../../components/UI/Input'
import Card from '../../components/UI/Card'
import { BookOpen, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const dispatch = useDispatch()
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth)
  const location = useLocation()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm()

  const from = location.state?.from?.pathname || '/dashboard'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const onSubmit = async (data) => {
    await dispatch(loginUser(data))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            COEP Technological University
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Director Portal - Sign in to your account
          </p>
        </div>

        <Card>
          <Card.Body>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <Input
                  label="Email address"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email"
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

              <div>
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    error={errors.password?.message}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: {
                        value: 6,
                        message: 'Password must be at least 6 characters'
                      }
                    })}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </div>
            </form>
          </Card.Body>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Default Super Admin: admin@coep.ac.in / Admin123!
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <Link to="/" className="text-primary-600 hover:text-primary-500">
              ← Back to Public Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
