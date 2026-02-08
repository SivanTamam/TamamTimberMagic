import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  LayoutDashboard, Image, Wrench, FileText, MessageSquare, 
  LogOut, Plus, Trash2, Edit, Loader2, X, Star 
} from 'lucide-react'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { GalleryItem } from '../../types'

export default function AdminGallery() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [formData, setFormData] = useState({
    title_en: '',
    title_he: '',
    description_en: '',
    description_he: '',
    category: '',
    is_featured: false,
    image_url: '',
    thumbnail_url: '',
  })

  const { data: gallery, isLoading } = useQuery({
    queryKey: ['gallery'],
    queryFn: api.gallery.getAll,
  })

  const createMutation = useMutation({
    mutationFn: api.gallery.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Gallery item added')
      closeModal()
    },
    onError: () => toast.error('Failed to add item'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<GalleryItem> }) => 
      api.gallery.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Gallery item updated')
      closeModal()
    },
    onError: () => toast.error('Failed to update item'),
  })

  const deleteMutation = useMutation({
    mutationFn: api.gallery.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Gallery item deleted')
    },
    onError: () => toast.error('Failed to delete item'),
  })

  const sidebarLinks = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/gallery', icon: Image, label: t('admin.gallery') },
    { path: '/admin/services', icon: Wrench, label: t('admin.services') },
    { path: '/admin/invoices', icon: FileText, label: t('admin.invoices') },
    { path: '/admin/requests', icon: MessageSquare, label: t('admin.requests') },
  ]

  const openModal = (item?: GalleryItem) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title_en: item.title_en,
        title_he: item.title_he,
        description_en: item.description_en,
        description_he: item.description_he,
        category: item.category,
        is_featured: item.is_featured,
        image_url: item.image_url,
        thumbnail_url: item.thumbnail_url,
      })
    } else {
      setEditingItem(null)
      setFormData({
        title_en: '',
        title_he: '',
        description_en: '',
        description_he: '',
        category: '',
        is_featured: false,
        image_url: '',
        thumbnail_url: '',
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      }
      const compressedFile = await imageCompression(file, options)
      
      const thumbnailOptions = {
        maxSizeMB: 0.1,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      }
      const thumbnailFile = await imageCompression(file, thumbnailOptions)

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image_url: reader.result as string }))
      }
      reader.readAsDataURL(compressedFile)

      const thumbReader = new FileReader()
      thumbReader.onloadend = () => {
        setFormData(prev => ({ ...prev, thumbnail_url: thumbReader.result as string }))
      }
      thumbReader.readAsDataURL(thumbnailFile)

      toast.success('Image compressed and ready')
    } catch {
      toast.error('Failed to process image')
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, data: formData })
    } else {
      createMutation.mutate(formData as Omit<GalleryItem, 'id' | 'created_at'>)
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
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.gallery')}</h1>
          <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Item
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-wood-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {gallery?.map((item: GalleryItem) => (
              <div key={item.id} className="card group relative">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={item.thumbnail_url || item.image_url}
                    alt={item.title_en}
                    className="w-full h-full object-cover"
                  />
                </div>
                {item.is_featured && (
                  <Star className="absolute top-2 right-2 w-5 h-5 text-yellow-500 fill-yellow-500" />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-wood-800 truncate">{item.title_en}</h3>
                  <p className="text-sm text-gray-500">{item.category}</p>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => openModal(item)}
                    className="p-2 bg-white rounded-full text-wood-600 hover:bg-wood-100"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    className="p-2 bg-white rounded-full text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
                </h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (Hebrew)</label>
                    <input
                      type="text"
                      value={formData.title_he}
                      onChange={(e) => setFormData({ ...formData, title_he: e.target.value })}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-wood-600 focus:ring-wood-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Featured</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="input-field"
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="mt-2 h-32 object-cover rounded" />
                  )}
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
