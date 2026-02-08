import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Loader2 } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminPage() {
  const { t } = useLanguage()
  const { isAuthenticated, login, isLoading } = useAuth()
  const navigate = useNavigate()

  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')

  if (isAuthenticated) {
    navigate('/admin/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const success = await login(credentials.username, credentials.password)
    if (success) {
      navigate('/admin/dashboard')
    } else {
      setError(t('admin.loginError'))
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-wood-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-wood-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.title')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.login')}</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.username')}
            </label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('admin.password')}
            </label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              t('admin.loginButton')
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
