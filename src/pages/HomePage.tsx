import { Link } from 'react-router-dom'
import { ArrowRight, Award, Globe, Users, ThumbsUp } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'

export default function HomePage() {
  const { t, direction } = useLanguage()

  const stats = [
    { icon: Award, value: '40+', label: t('about.experience') },
    { icon: Users, value: '500+', label: t('about.projects') },
    { icon: Globe, value: '3', label: t('about.countries') },
    { icon: ThumbsUp, value: '100%', label: t('about.satisfaction') },
  ]

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-wood-800 to-wood-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1920')] bg-cover bg-center" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 leading-tight">
              {t('hero.title')}
            </h1>
            <p className="text-xl md:text-2xl text-wood-200 mb-2">
              {t('hero.subtitle')}
            </p>
            <p className="text-lg text-wood-300 mb-8 max-w-2xl">
              {t('hero.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/gallery"
                className="btn-primary inline-flex items-center justify-center gap-2"
              >
                {t('hero.cta')}
                <ArrowRight className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
              </Link>
              <Link
                to="/request"
                className="btn-outline border-white text-white hover:bg-white hover:text-wood-900 inline-flex items-center justify-center"
              >
                {t('hero.ctaSecondary')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="section-title mb-2">{t('about.title')}</h2>
              <p className="section-subtitle mb-6">{t('about.subtitle')}</p>
              <p className="text-gray-600 leading-relaxed">
                {t('about.description')}
              </p>
            </div>
            <div className="relative">
              <img
                src="/img/tamam.jpeg"
                alt="Tamam - Master Carpenter"
                className="rounded-xl shadow-2xl w-full max-w-md mx-auto object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-wood-600 text-white p-6 rounded-xl shadow-lg">
                <p className="text-3xl font-bold">40+</p>
                <p className="text-wood-200">{t('about.experience')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-forest-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-forest-600 text-white rounded-full mb-4">
                  <stat.icon className="w-8 h-8" />
                </div>
                <p className="text-3xl font-bold text-forest-900">{stat.value}</p>
                <p className="text-forest-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-wood-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-4">{t('request.title')}</h2>
          <p className="text-gray-600 mb-8">{t('request.subtitle')}</p>
          <Link to="/request" className="btn-primary inline-flex items-center gap-2">
            {t('hero.ctaSecondary')}
            <ArrowRight className={`w-5 h-5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>
    </div>
  )
}
