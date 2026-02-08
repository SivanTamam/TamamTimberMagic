import { Phone, Mail, MapPin } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'

export default function Footer() {
  const { t } = useLanguage()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-wood-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-serif font-bold mb-2">Tamam Timber Magic</h3>
            <p className="text-wood-200">{t('footer.tagline')}</p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contact')}</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 rtl:flex-row-reverse rtl:justify-end">
                <Phone className="w-5 h-5 text-wood-400" />
                <span className="text-wood-200">+972-50-123-4567</span>
              </li>
              <li className="flex items-center gap-3 rtl:flex-row-reverse rtl:justify-end">
                <Mail className="w-5 h-5 text-wood-400" />
                <span className="text-wood-200">tamam@timbermagic.com</span>
              </li>
              <li className="flex items-center gap-3 rtl:flex-row-reverse rtl:justify-end">
                <MapPin className="w-5 h-5 text-wood-400" />
                <span className="text-wood-200">Tel Aviv, Israel</span>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.hours')}</h4>
            <p className="text-wood-200">{t('footer.hoursValue')}</p>
          </div>
        </div>

        <div className="border-t border-wood-700 mt-8 pt-8 text-center text-wood-300">
          <p>© {currentYear} Tamam Timber Magic. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  )
}
