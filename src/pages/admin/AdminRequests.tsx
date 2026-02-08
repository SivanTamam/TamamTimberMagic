import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  LayoutDashboard, Image, Wrench, FileText, MessageSquare, 
  LogOut, Loader2, CheckCircle, Clock, XCircle, PlayCircle 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { ServiceRequest } from '../../types'

export default function AdminRequests() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const queryClient = useQueryClient()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: api.requests.getAll,
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ServiceRequest['status'] }) =>
      api.requests.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Status updated')
    },
    onError: () => toast.error('Failed to update status'),
  })

  const sidebarLinks = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/gallery', icon: Image, label: t('admin.gallery') },
    { path: '/admin/services', icon: Wrench, label: t('admin.services') },
    { path: '/admin/invoices', icon: FileText, label: t('admin.invoices') },
    { path: '/admin/requests', icon: MessageSquare, label: t('admin.requests') },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress': return <PlayCircle className="w-4 h-4 text-blue-600" />
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'in_progress': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-yellow-100 text-yellow-700'
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
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

      <main className="flex-1 p-6 bg-gray-50">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.requests')}</h1>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-wood-600" />
          </div>
        ) : (
          <div className="space-y-4">
            {requests?.map((request: ServiceRequest) => (
              <div key={request.id} className="card p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusIcon(request.status)}
                      <h3 className="font-semibold text-gray-900">
                        {request.customer?.name || 'Unknown Customer'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{request.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      {request.customer?.email && (
                        <span>📧 {request.customer.email}</span>
                      )}
                      {request.customer?.phone && (
                        <span>📞 {request.customer.phone}</span>
                      )}
                      <span>📅 {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={request.status}
                      onChange={(e) => updateStatusMutation.mutate({ 
                        id: request.id, 
                        status: e.target.value as ServiceRequest['status'] 
                      })}
                      className="input-field py-2 text-sm"
                      disabled={updateStatusMutation.isPending}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}

            {(!requests || requests.length === 0) && (
              <div className="text-center py-12 text-gray-500">
                No requests yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
