import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  LayoutDashboard, Image, Wrench, FileText, MessageSquare, 
  LogOut, Plus, Trash2, Edit, Loader2, X 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Service } from '../../types'

export default function AdminServices() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Service | null>(null)
  const [formData, setFormData] = useState({
    name_en: '',
    name_he: '',
    description_en: '',
    description_he: '',
    price_from: 0,
    price_to: null as number | null,
    image_url: '',
    is_active: true,
  })

  const { data: services, isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: api.services.getAll,
  })

  const createMutation = useMutation({
    mutationFn: api.services.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service added')
      closeModal()
    },
    onError: () => toast.error('Failed to add service'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) => 
      api.services.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service updated')
      closeModal()
    },
    onError: () => toast.error('Failed to update service'),
  })

  const deleteMutation = useMutation({
    mutationFn: api.services.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      toast.success('Service deleted')
    },
    onError: () => toast.error('Failed to delete service'),
  })

  const sidebarLinks = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/gallery', icon: Image, label: t('admin.gallery') },
    { path: '/admin/services', icon: Wrench, label: t('admin.services') },
    { path: '/admin/invoices', icon: FileText, label: t('admin.invoices') },
    { path: '/admin/requests', icon: MessageSquare, label: t('admin.requests') },
  ]

  const openModal = (item?: Service) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        name_en: item.name_en,
        name_he: item.name_he,
        description_en: item.description_en,
        description_he: item.description_he,
        price_from: item.price_from,
        price_to: item.price_to,
        image_url: item.image_url,
        is_active: item.is_active,
      })
    } else {
      setEditingItem(null)
      setFormData({
        name_en: '',
        name_he: '',
        description_en: '',
        description_he: '',
        price_from: 0,
        price_to: null,
        image_url: '',
        is_active: true,
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData })
    } else {
      createMutation.mutate(formData as Omit<Service, 'id' | 'created_at' | 'updated_at'>)
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.services')}</h1>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-wood-600" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Service</th>
                  <th className="text-left p-4 font-medium text-gray-600">Price Range</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services?.map((service: Service) => (
                  <tr key={service.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {service.image_url && (
                          <img src={service.image_url} alt="" className="w-12 h-12 rounded object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{service.name_en}</p>
                          <p className="text-sm text-gray-500">{service.name_he}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      ₪{service.price_from.toLocaleString()}
                      {service.price_to && ` - ₪${service.price_to.toLocaleString()}`}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        service.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => openModal(service)}
                        className="p-2 text-wood-600 hover:bg-wood-100 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(service.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Service' : 'Add Service'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)</label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name (Hebrew)</label>
                    <input
                      type="text"
                      value={formData.name_he}
                      onChange={(e) => setFormData({ ...formData, name_he: e.target.value })}
                      required
                      className="input-field"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                    <textarea
                      value={formData.description_en}
                      onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                      rows={3}
                      className="input-field resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Hebrew)</label>
                    <textarea
                      value={formData.description_he}
                      onChange={(e) => setFormData({ ...formData, description_he: e.target.value })}
                      rows={3}
                      className="input-field resize-none"
                      dir="rtl"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price From (₪)</label>
                    <input
                      type="number"
                      value={formData.price_from}
                      onChange={(e) => setFormData({ ...formData, price_from: Number(e.target.value) })}
                      required
                      min="0"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price To (₪, optional)</label>
                    <input
                      type="number"
                      value={formData.price_to || ''}
                      onChange={(e) => setFormData({ ...formData, price_to: e.target.value ? Number(e.target.value) : null })}
                      min="0"
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-wood-600 focus:ring-wood-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active</span>
                  </label>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={closeModal} className="btn-outline">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn-primary"
                  >
                    {(createMutation.isPending || updateMutation.isPending) ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
