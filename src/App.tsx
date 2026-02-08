import { Routes, Route } from 'react-router-dom'
import { useLanguage } from './contexts/LanguageContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import ServicesPage from './pages/ServicesPage'
import GalleryPage from './pages/GalleryPage'
import RequestPage from './pages/RequestPage'
import AdminPage from './pages/admin/AdminPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminGallery from './pages/admin/AdminGallery'
import AdminServices from './pages/admin/AdminServices'
import AdminInvoices from './pages/admin/AdminInvoices'
import AdminRequests from './pages/admin/AdminRequests'
import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {
  const { direction } = useLanguage()

  return (
    <div dir={direction} className={direction === 'rtl' ? 'font-hebrew' : 'font-sans'}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="services" element={<ServicesPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="request" element={<RequestPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route
            path="admin/dashboard"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/gallery"
            element={
              <ProtectedRoute>
                <AdminGallery />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/services"
            element={
              <ProtectedRoute>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/invoices"
            element={
              <ProtectedRoute>
                <AdminInvoices />
              </ProtectedRoute>
            }
          />
          <Route
            path="admin/requests"
            element={
              <ProtectedRoute>
                <AdminRequests />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </div>
  )
}

export default App
