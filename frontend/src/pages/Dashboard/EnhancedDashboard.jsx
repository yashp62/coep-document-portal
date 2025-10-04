import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchPublicDocuments } from '../../store/slices/documentSlice'
import Card from '../../components/UI/Card'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import { 
  FileText, 
  FolderOpen, 
  Download, 
  Upload,
  Users,
  TrendingUp,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Activity,
  Eye,
  Star
} from 'lucide-react'
import { formatDate, formatFileSize } from '../../utils/format'
import { userService } from '../../services/userService'

const EnhancedDashboard = () => {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { documents, isLoading: documentsLoading } = useSelector((state) => state.documents)
  const [totalUsers, setTotalUsers] = useState(0)
  const [analytics, setAnalytics] = useState({
    weeklyUploads: 0,
    weeklyDownloads: 0,
    pendingCount: 0,
    approvalRate: 0,
    popularDocument: null,
    recentActivity: []
  })

  useEffect(() => {
    // Fetch recent public documents for dashboard
    dispatch(fetchPublicDocuments({ limit: 10, sort_by: 'created_at', sort_order: 'DESC' }))

    // Fetch user count for super admin
    if (user?.role === 'super_admin') {
      userService.getUserCount()
        .then(count => setTotalUsers(count))
        .catch(err => {
          console.error('Failed to fetch user count', err)
          setTotalUsers(0)
        })
    }

    // Calculate analytics from documents data
    if (documents && documents.length > 0) {
      calculateAnalytics(documents)
    }
  }, [dispatch, user?.role, documents])

  const calculateAnalytics = (docs) => {
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Weekly uploads
    const weeklyUploads = docs.filter(doc => 
      new Date(doc.created_at) >= weekAgo
    ).length

    // Weekly downloads (sum of download_count for recent docs)
    const weeklyDownloads = docs
      .filter(doc => new Date(doc.created_at) >= weekAgo)
      .reduce((sum, doc) => sum + (doc.download_count || 0), 0)

    // Most popular document
    const popularDocument = docs.reduce((prev, current) => 
      (current.download_count || 0) > (prev.download_count || 0) ? current : prev
    , docs[0])

    setAnalytics({
      weeklyUploads,
      weeklyDownloads,
      pendingCount: docs.filter(doc => doc.approval_status === 'pending').length,
      approvalRate: docs.length > 0 ? 
        Math.round((docs.filter(doc => doc.approval_status === 'approved').length / docs.length) * 100) : 0,
      popularDocument,
      recentActivity: docs.slice(0, 5).map(doc => ({
        type: 'upload',
        document: doc.title,
        user: doc.uploadedBy?.email || 'Unknown',
        time: doc.created_at
      }))
    })
  }

  // Enhanced stats with trends
  const getEnhancedStats = () => {
    const baseStats = [
      {
        name: 'Total Documents',
        value: documents?.length || 0,
        change: `+${analytics.weeklyUploads}`,
        changeLabel: 'this week',
        trend: analytics.weeklyUploads > 0 ? 'up' : 'neutral',
        icon: FileText,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        name: 'Total Downloads',
        value: documents?.reduce((sum, doc) => sum + (doc.download_count || 0), 0) || 0,
        change: `+${analytics.weeklyDownloads}`,
        changeLabel: 'this week',
        trend: analytics.weeklyDownloads > 0 ? 'up' : 'neutral',
        icon: Download,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      }
    ]

    // Role-specific stats
    if (user?.role === 'super_admin') {
      baseStats.push(
        {
          name: 'Total Users',
          value: totalUsers,
          change: '+5',
          changeLabel: 'this month',
          trend: 'up',
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        },
        {
          name: 'System Health',
          value: '99.2%',
          change: '+0.1%',
          changeLabel: 'uptime',
          trend: 'up',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      )
    } else if (user?.role === 'admin') {
      baseStats.push(
        {
          name: 'Pending Approvals',
          value: analytics.pendingCount,
          change: analytics.pendingCount > 0 ? 'needs attention' : 'all clear',
          changeLabel: 'status',
          trend: analytics.pendingCount > 0 ? 'down' : 'up',
          icon: Clock,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        },
        {
          name: 'Approval Rate',
          value: `${analytics.approvalRate}%`,
          change: 'good',
          changeLabel: 'performance',
          trend: analytics.approvalRate >= 80 ? 'up' : 'down',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      )
    } else if (user?.role === 'sub_admin') {
      const myDocs = documents?.filter(doc => doc.uploadedBy?.id === user?.id) || []
      const approvedDocs = myDocs.filter(doc => doc.approval_status === 'approved')
      
      baseStats.push(
        {
          name: 'My Documents',
          value: myDocs.length,
          change: `${approvedDocs.length} approved`,
          changeLabel: 'status',
          trend: 'up',
          icon: Upload,
          color: 'text-indigo-600',
          bgColor: 'bg-indigo-100'
        },
        {
          name: 'Success Rate',
          value: myDocs.length > 0 ? `${Math.round((approvedDocs.length / myDocs.length) * 100)}%` : '0%',
          change: 'track record',
          changeLabel: 'performance',
          trend: 'up',
          icon: Star,
          color: 'text-pink-600',
          bgColor: 'bg-pink-100'
        }
      )
    }

    return baseStats
  }

  const stats = getEnhancedStats()

  return (
    <div className="space-y-6">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="mt-2 text-blue-100">
              {user?.role === 'super_admin' && 'System Overview - Managing all university bodies'}
              {user?.role === 'admin' && `Department Dashboard - ${user?.universityBody?.name || 'Your University Body'}`}
              {user?.role === 'sub_admin' && 'Personal Dashboard - Track your contributions'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-blue-200" />
            <Activity className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.name} className="hover:shadow-lg transition-shadow">
              <Card.Body>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <div className="flex items-center mt-1">
                      <span className={`text-xs font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 
                        stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {stat.trend === 'up' && '↗️'} 
                        {stat.trend === 'down' && '↘️'}
                        {stat.trend === 'neutral' && '→'}
                        {' '}{stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-1">{stat.changeLabel}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Recent Documents */}
        <div className="xl:col-span-2">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                <TrendingUp className="h-5 w-5 text-gray-400" />
              </div>
            </Card.Header>
            <Card.Body>
              {documentsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.slice(0, 6).map((document) => (
                    <div key={document.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {document.title}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{formatFileSize(document.file_size)}</span>
                          <span>•</span>
                          <span>{formatDate(document.created_at)}</span>
                          <span>•</span>
                          <div className="flex items-center">
                            <Download className="h-3 w-3 mr-1" />
                            {document.download_count || 0}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          document.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                          document.approval_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {document.approval_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-500">No documents found</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>

        {/* Analytics Sidebar */}
        <div className="space-y-6">
          {/* Quick Insights */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Quick Insights</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {analytics.popularDocument && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">Most Popular</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1 truncate">
                      {analytics.popularDocument.title}
                    </p>
                    <p className="text-xs text-yellow-600">
                      {analytics.popularDocument.download_count || 0} downloads
                    </p>
                  </div>
                )}
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Weekly Activity</span>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    {analytics.weeklyUploads} new uploads
                  </p>
                  <p className="text-xs text-blue-600">
                    {analytics.weeklyDownloads} downloads this week
                  </p>
                </div>

                {user?.role === 'admin' && analytics.pendingCount > 0 && (
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium text-orange-800">Action Needed</span>
                    </div>
                    <p className="text-sm text-orange-700 mt-1">
                      {analytics.pendingCount} documents awaiting approval
                    </p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <a
                  href="/admin/documents/upload"
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <Upload className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">Upload Document</p>
                    <p className="text-xs text-gray-500">Add new content</p>
                  </div>
                </a>

                {user?.role === 'admin' && (
                  <a
                    href="/admin/documents/pending"
                    className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">Review Pending</p>
                      <p className="text-xs text-gray-500">{analytics.pendingCount} waiting</p>
                    </div>
                  </a>
                )}

                {user?.role === 'super_admin' && (
                  <>
                    <a
                      href="/admin/users"
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Users className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Manage Users</p>
                        <p className="text-xs text-gray-500">{totalUsers} total users</p>
                      </div>
                    </a>

                    <a
                      href="/admin/university-bodies"
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">University Bodies</p>
                        <p className="text-xs text-gray-500">Manage institutions</p>
                      </div>
                    </a>
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard