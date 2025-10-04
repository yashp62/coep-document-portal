import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { 
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  BookOpen,
  Building2,
  UserCheck,
  X
} from 'lucide-react'

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { user } = useAuth()

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: ['admin', 'sub_admin', 'super_admin']
      }
    ]

    if (user?.role === 'super_admin') {
      return [
        ...baseItems,
        {
          name: 'All Documents',
          href: '/admin/documents',
          icon: FileText,
          roles: ['super_admin']
        },
        {
          name: 'My Documents',
          href: '/admin/my-documents',
          icon: BookOpen,
          roles: ['super_admin']
        },
        {
          name: 'Upload Document',
          href: '/admin/documents/upload',
          icon: Upload,
          roles: ['super_admin']
        },
        {
          name: 'University Bodies',
          href: '/admin/university-bodies',
          icon: Building2,
          roles: ['super_admin']
        },
        {
          name: 'Users',
          href: '/admin/users',
          icon: Users,
          roles: ['super_admin']
        }
      ]
    } else if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          name: 'All Documents',
          href: '/admin/documents',
          icon: FileText,
          roles: ['admin']
        },
        {
          name: 'Pending Approval',
          href: '/admin/documents/pending',
          icon: UserCheck,
          roles: ['admin']
        },
        {
          name: 'My Documents',
          href: '/admin/my-documents',
          icon: BookOpen,
          roles: ['admin']
        },
        {
          name: 'Upload Document',
          href: '/admin/documents/upload',
          icon: Upload,
          roles: ['admin']
        }
      ]
    } else if (user?.role === 'sub_admin') {
      return [
        ...baseItems,
        {
          name: 'My Documents',
          href: '/sub-admin/my-documents',
          icon: BookOpen,
          roles: ['sub_admin']
        },
        {
          name: 'Upload Document',
          href: '/sub-admin/documents/upload',
          icon: Upload,
          roles: ['sub_admin']
        }
      ]
    }

    return baseItems
  }

  const filteredNavigation = getNavigationItems().filter(item => 
    item.roles.includes(user?.role)
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 lg:pt-14 lg:pb-4 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <Icon
                    className="mr-3 h-5 w-5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 flex z-40">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <nav className="mt-5 px-2 space-y-1">
                  {filteredNavigation.map((item) => {
                    const Icon = item.icon
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                            isActive
                              ? 'bg-primary-100 text-primary-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`
                        }
                      >
                        <Icon
                          className="mr-4 h-6 w-6 flex-shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    )
                  })}
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar
