import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  Bell, 
  Search, 
  User, 
  LogOut, 
  Settings,
  Menu,
  X,
  Home
} from 'lucide-react'

const Header = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
  }

  const handleProfileClick = () => {
    navigate('/admin/profile')
    setIsProfileOpen(false)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Mobile menu button */}
          <div className="flex items-center">
            <button
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Brand/Title */}
            <div className="ml-4 lg:ml-0">
              <h1 className="text-lg font-semibold text-gray-900">
                Document Management System
              </h1>
            </div>
          </div>

          {/* Right side - User menu only */}
          <div className="flex items-center">
            {/* User menu */}
            <div className="relative">
              <button
                className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.replace('_', ' ')}
                  </p>
                </div>
              </button>

              {/* Dropdown menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <Link
                    to="/"
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsProfileOpen(false)}
                  >
                    <Home size={16} className="mr-3" />
                    Public Portal
                  </Link>
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={handleProfileClick}
                  >
                    <Settings size={16} className="mr-3" />
                    Profile Settings
                  </button>
                  <hr className="my-1" />
                  <button
                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
