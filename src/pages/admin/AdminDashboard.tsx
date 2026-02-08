import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { 
  LayoutDashboard, Image, Wrench, FileText, MessageSquare, 
  LogOut, TrendingUp, Users, DollarSign, Clock, Loader2 
} from 'lucide-react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export default function AdminDashboard() {
  const { t } = useLanguage()
  const { logout } = useAuth()

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.dashboard.getStats,
  })

  const sidebarLinks = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/gallery', icon: Image, label: t('admin.gallery') },
    { path: '/admin/services', icon: Wrench, label: t('admin.services') },
    { path: '/admin/invoices', icon: FileText, label: t('admin.invoices') },
    { path: '/admin/requests', icon: MessageSquare, label: t('admin.requests') },
  ]

  const statCards = [
    { icon: MessageSquare, label: t('admin.stats.totalRequests'), value: stats?.totalRequests || 0, color: 'bg-blue-500' },
    { icon: Clock, label: t('admin.stats.pendingRequests'), value: stats?.pendingRequests || 0, color: 'bg-yellow-500' },
    { icon: Users, label: t('admin.stats.completedProjects'), value: stats?.completedProjects || 0, color: 'bg-green-500' },
    { icon: DollarSign, label: t('admin.stats.totalRevenue'), value: `₪${(stats?.totalRevenue || 0).toLocaleString()}`, color: 'bg-purple-500' },
  ]

  const revenueChartData = {
    labels: stats?.monthlyRevenue?.map(m => m.month) || [],
    datasets: [{
      label: 'Revenue (₪)',
      data: stats?.monthlyRevenue?.map(m => m.revenue) || [],
      backgroundColor: 'rgba(214, 129, 71, 0.8)',
      borderColor: 'rgb(214, 129, 71)',
      borderWidth: 1,
    }],
  }

  const statusChartData = {
    labels: stats?.requestsByStatus?.map(s => s.status) || [],
    datasets: [{
      data: stats?.requestsByStatus?.map(s => s.count) || [],
      backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
    }],
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 bg-wood-900 text-white p-4 hidden md:block">
        <nav className="space-y-2">
          {sidebarLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-wood-800 transition-colors"
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-wood-800 transition-colors w-full text-left text-red-300"
          >
            <LogOut className="w-5 h-5" />
            {t('admin.logout')}
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.dashboard')}</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-wood-600" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div key={index} className="card p-6">
                  <div className="flex items-center gap-4">
                    <div className={`${stat.color} p-3 rounded-lg text-white`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-wood-600" />
                  Monthly Revenue
                </h3>
                <Bar data={revenueChartData} options={{ responsive: true }} />
              </div>
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Requests by Status</h3>
                <div className="max-w-xs mx-auto">
                  <Doughnut data={statusChartData} options={{ responsive: true }} />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
