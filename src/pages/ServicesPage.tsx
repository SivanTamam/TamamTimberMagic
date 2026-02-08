import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { api } from '../services/api'
import type { Service } from '../types'

export default function ServicesPage() {
  const { t, language } = useLanguage()

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: api.services.getAll,
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
        <p className="text-red-600">Failed to load services. Please try again later.</p>
      </div>
    )
  }

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="section-title">{t('services.title')}</h1>
          <p className="section-subtitle">{t('services.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services?.map((service: Service) => (
            <div key={service.id} className="card group hover:shadow-xl transition-shadow">
              <div className="aspect-video overflow-hidden">
                <img
                  src={service.image_url || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'}
                  alt={language === 'he' ? service.name_he : service.name_en}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-wood-800 mb-2">
                  {language === 'he' ? service.name_he : service.name_en}
                </h3>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {language === 'he' ? service.description_he : service.description_en}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-wood-600 font-semibold">
                    {t('services.priceFrom')} ₪{service.price_from.toLocaleString()}
                    {service.price_to && ` - ₪${service.price_to.toLocaleString()}`}
                  </p>
                  <Link
                    to={`/request?service=${service.id}`}
                    className="text-forest-600 hover:text-forest-700 font-medium"
                  >
                    {t('services.requestQuote')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {(!services || services.length === 0) && (
          <div className="text-center py-12">
            <p className="text-gray-500">No services available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}
