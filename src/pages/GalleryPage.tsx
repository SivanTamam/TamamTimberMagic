import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Loader2, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import type { GalleryItem } from '../types'

export default function GalleryPage() {
  const { t, language } = useLanguage()
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null)

  const { data: gallery, isLoading, error } = useQuery({
    queryKey: ['gallery'],
    queryFn: api.gallery.getAll,
  })

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-wood-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-red-600">Failed to load gallery. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-title">{t('gallery.title')}</h1>
          <p className="section-subtitle">{t('gallery.subtitle')}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gallery?.map((item: GalleryItem) => (
            <div
              key={item.id}
              className="card cursor-pointer group"
              onClick={() => setSelectedImage(item)}
            >
              <div className="aspect-square overflow-hidden relative">
                <img
                  src={item.thumbnail_url || item.image_url}
                  alt={language === 'he' ? item.title_he : item.title_en}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {item.is_featured && (
                  <span className="absolute top-3 right-3 rtl:right-auto rtl:left-3 bg-wood-600 text-white text-xs px-2 py-1 rounded">
                    {t('gallery.featured')}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-wood-800">
                  {language === 'he' ? item.title_he : item.title_en}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {language === 'he' ? item.description_he : item.description_en}
                </p>
              </div>
            </div>
          ))}
        </div>

        {(!gallery || gallery.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No gallery items available at the moment.</p>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={language === 'he' ? selectedImage.title_he : selectedImage.title_en}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="text-white text-center mt-4">
              <h3 className="text-xl font-semibold">
                {language === 'he' ? selectedImage.title_he : selectedImage.title_en}
              </h3>
              <p className="text-gray-300 mt-2">
                {language === 'he' ? selectedImage.description_he : selectedImage.description_en}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
