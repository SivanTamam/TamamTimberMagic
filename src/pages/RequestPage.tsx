import { useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Send, Loader2, ImagePlus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import imageCompression from 'browser-image-compression'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'

export default function RequestPage() {
  const { t, language } = useLanguage()
  const [searchParams] = useSearchParams()
  const preselectedService = searchParams.get('service') || ''

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service_id: preselectedService,
    description: '',
  })
  const [inspirationImages, setInspirationImages] = useState<{ file: File; preview: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: services } = useQuery({
    queryKey: ['services'],
    queryFn: api.services.getAll,
  })

  const mutation = useMutation({
    mutationFn: async (data: typeof formData & { images?: string[] }) => {
      return api.requests.create(data)
    },
    onSuccess: () => {
      toast.success(t('request.form.success'))
      setFormData({ name: '', email: '', phone: '', service_id: '', description: '' })
      setInspirationImages([])
    },
    onError: () => {
      toast.error(t('request.form.error'))
    },
  })

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const maxImages = 5
    if (inspirationImages.length + files.length > maxImages) {
      toast.error(language === 'he' ? `ניתן להעלות עד ${maxImages} תמונות` : `Maximum ${maxImages} images allowed`)
      return
    }

    const newImages: { file: File; preview: string }[] = []

    for (const file of Array.from(files)) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        })
        const preview = URL.createObjectURL(compressedFile)
        newImages.push({ file: compressedFile, preview })
      } catch (error) {
        console.error('Error compressing image:', error)
        toast.error(language === 'he' ? 'שגיאה בהעלאת תמונה' : 'Error uploading image')
      }
    }

    setInspirationImages((prev) => [...prev, ...newImages])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setInspirationImages((prev) => {
      const newImages = [...prev]
      URL.revokeObjectURL(newImages[index].preview)
      newImages.splice(index, 1)
      return newImages
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert images to base64 for email
    const imagePromises = inspirationImages.map((img) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(img.file)
      })
    })
    
    const base64Images = await Promise.all(imagePromises)
    mutation.mutate({ ...formData, images: base64Images })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-title">{t('request.title')}</h1>
          <p className="section-subtitle">{t('request.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                {t('request.form.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('request.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('request.form.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="service_id" className="block text-sm font-medium text-gray-700 mb-2">
                {t('request.form.service')}
              </label>
              <select
                id="service_id"
                name="service_id"
                value={formData.service_id}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">{t('request.form.service')}</option>
                {services?.map((service) => (
                  <option key={service.id} value={service.id}>
                    {language === 'he' ? service.name_he : service.name_en}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('request.form.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="input-field resize-none"
              />
            </div>

            {/* Inspiration Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'he' ? 'תמונות השראה (אופציונלי)' : 'Inspiration Images (Optional)'}
              </label>
              <p className="text-sm text-gray-500 mb-3">
                {language === 'he' 
                  ? 'העלה עד 5 תמונות להמחשת הרעיון שלך' 
                  : 'Upload up to 5 images to illustrate your idea'}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-3">
                {inspirationImages.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Inspiration ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {inspirationImages.length < 5 && (
                  <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-wood-500 hover:bg-wood-50 transition-colors">
                    <ImagePlus className="w-6 h-6 text-gray-400" />
                    <span className="text-xs text-gray-500 mt-1">
                      {language === 'he' ? 'הוסף' : 'Add'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={mutation.isPending}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t('request.form.submitting')}
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {t('request.form.submit')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
