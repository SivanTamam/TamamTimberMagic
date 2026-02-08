import axios from 'axios'
import type { Service, GalleryItem, ServiceRequest, Invoice, Customer, DashboardStats } from '../types'

const supabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL

const apiClient = axios.create({
  baseURL: '/.netlify/functions',
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Mock data for development when Supabase isn't configured
const mockServices: Service[] = [
  {
    id: '1',
    name_en: 'Wooden Decks',
    name_he: 'דקים מעץ',
    description_en: 'Durable and beautiful outdoor wooden decks for gardens and patios with built-in seating.',
    description_he: 'דקים חיצוניים עמידים ויפים מעץ לגינות ומרפסות עם ישיבה מובנית.',
    price_from: 4000,
    price_to: 25000,
    image_url: '/img/gallery-deck-1.jpeg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name_en: 'Pergolas',
    name_he: 'פרגולות',
    description_en: 'Custom wooden pergolas with corrugated or transparent roofing for outdoor living.',
    description_he: 'פרגולות עץ מותאמות אישית עם גג גלי או שקוף לחיים בחוץ.',
    price_from: 3000,
    price_to: 20000,
    image_url: '/img/gallery-pergola-1.jpeg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name_en: 'Wooden Stairs',
    name_he: 'מדרגות עץ',
    description_en: 'Elegant custom wooden staircases with matching handrails for any home.',
    description_he: 'גרמי מדרגות עץ אלגנטיים עם מעקות תואמים לכל בית.',
    price_from: 5000,
    price_to: 25000,
    image_url: '/img/gallery-stairs-1.jpeg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name_en: 'Patio Covers',
    name_he: 'הצללות לפטיו',
    description_en: 'Spacious patio pergolas with transparent roofing for natural light.',
    description_he: 'פרגולות פטיו מרווחות עם גג שקוף לאור טבעי.',
    price_from: 3000,
    price_to: 18000,
    image_url: '/img/gallery-pergola-3.jpeg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name_en: 'Garden Structures',
    name_he: 'מבני גינה',
    description_en: 'Sturdy wooden garden structures and pergolas with scenic views.',
    description_he: 'מבני גינה ופרגולות עץ יציבים עם נוף מרהיב.',
    price_from: 4000,
    price_to: 22000,
    image_url: '/img/gallery-pergola-2.jpeg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    name_en: 'Interior Stairs',
    name_he: 'מדרגות פנים',
    description_en: 'Modern interior staircases with dark wood finish and wooden handrails.',
    description_he: 'גרמי מדרגות פנים מודרניים עם גימור עץ כהה ומעקות עץ.',
    price_from: 6000,
    price_to: 30000,
    image_url: '/img/gallery-stairs-2.jpeg',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const mockGallery: GalleryItem[] = [
  {
    id: '1',
    title_en: 'Covered Wooden Deck',
    title_he: 'דק עץ מקורה',
    description_en: 'Beautiful covered wooden deck with stairs and built-in seating area.',
    description_he: 'דק עץ מקורה יפהפה עם מדרגות ואזור ישיבה מובנה.',
    image_url: '/img/gallery-deck-1.jpeg',
    thumbnail_url: '/img/gallery-deck-1.jpeg',
    category: 'Decks',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    title_en: 'Garden Pergola',
    title_he: 'פרגולה לגינה',
    description_en: 'Custom wooden pergola with corrugated roof, perfect for outdoor living.',
    description_he: 'פרגולת עץ מותאמת אישית עם גג גלי, מושלמת לחיים בחוץ.',
    image_url: '/img/gallery-pergola-1.jpeg',
    thumbnail_url: '/img/gallery-pergola-1.jpeg',
    category: 'Pergolas',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title_en: 'Wooden Pergola Structure',
    title_he: 'מבנה פרגולה מעץ',
    description_en: 'Sturdy wooden pergola with scenic mountain views.',
    description_he: 'פרגולת עץ יציבה עם נוף הרים מרהיב.',
    image_url: '/img/gallery-pergola-2.jpeg',
    thumbnail_url: '/img/gallery-pergola-2.jpeg',
    category: 'Pergolas',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title_en: 'Custom Wooden Staircase',
    title_he: 'גרם מדרגות עץ מותאם',
    description_en: 'Elegant L-shaped wooden staircase with matching handrail.',
    description_he: 'גרם מדרגות עץ אלגנטי בצורת L עם מעקה תואם.',
    image_url: '/img/gallery-stairs-1.jpeg',
    thumbnail_url: '/img/gallery-stairs-1.jpeg',
    category: 'Stairs',
    is_featured: true,
    created_at: new Date().toISOString(),
  },
  {
    id: '5',
    title_en: 'Patio Pergola',
    title_he: 'פרגולה לפטיו',
    description_en: 'Spacious patio pergola with transparent roofing for natural light.',
    description_he: 'פרגולת פטיו מרווחת עם גג שקוף לאור טבעי.',
    image_url: '/img/gallery-pergola-3.jpeg',
    thumbnail_url: '/img/gallery-pergola-3.jpeg',
    category: 'Pergolas',
    is_featured: false,
    created_at: new Date().toISOString(),
  },
  {
    id: '6',
    title_en: 'Modern Wooden Stairs',
    title_he: 'מדרגות עץ מודרניות',
    description_en: 'Clean modern staircase with dark wood finish and wooden handrail.',
    description_he: 'גרם מדרגות מודרני ונקי עם גימור עץ כהה ומעקה עץ.',
    image_url: '/img/gallery-stairs-2.jpeg',
    thumbnail_url: '/img/gallery-stairs-2.jpeg',
    category: 'Stairs',
    is_featured: false,
    created_at: new Date().toISOString(),
  },
]

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      // For development, check against hardcoded credentials
      if (username === 'tamam' && password === 'admin123') {
        const token = btoa(`${username}:${Date.now()}`)
        return { success: true, token }
      }
      // Try API if available
      try {
        const response = await apiClient.post<{ success: boolean; token?: string }>('/auth', { username, password })
        return response.data
      } catch {
        return { success: false }
      }
    },
  },

  services: {
    getAll: async (): Promise<Service[]> => {
      if (!supabaseConfigured) {
        return mockServices
      }
      try {
        const response = await apiClient.get<Service[]>('/services')
        return response.data || mockServices
      } catch (error) {
        console.error('API error:', error)
        return mockServices
      }
    },
    getById: async (id: string): Promise<Service> => {
      const response = await apiClient.get<Service>(`/services?id=${id}`)
      return response.data
    },
    create: async (service: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> => {
      const response = await apiClient.post<Service>('/services', service)
      return response.data
    },
    update: async (id: string, service: Partial<Service>): Promise<Service> => {
      const response = await apiClient.put<Service>('/services', { id, ...service })
      return response.data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/services?id=${id}`)
    },
  },

  gallery: {
    getAll: async (): Promise<GalleryItem[]> => {
      if (!supabaseConfigured) {
        return mockGallery
      }
      try {
        const response = await apiClient.get<GalleryItem[]>('/gallery')
        return response.data || mockGallery
      } catch (error) {
        console.error('API error:', error)
        return mockGallery
      }
    },
    getFeatured: async (): Promise<GalleryItem[]> => {
      if (!supabaseConfigured) {
        return mockGallery.filter(item => item.is_featured)
      }
      try {
        const response = await apiClient.get<GalleryItem[]>('/gallery?featured=true')
        return response.data || mockGallery.filter(item => item.is_featured)
      } catch (error) {
        console.error('API error:', error)
        return mockGallery.filter(item => item.is_featured)
      }
    },
    create: async (item: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> => {
      const response = await apiClient.post<GalleryItem>('/gallery', item)
      return response.data
    },
    update: async (id: string, item: Partial<GalleryItem>): Promise<GalleryItem> => {
      const response = await apiClient.put<GalleryItem>('/gallery', { id, ...item })
      return response.data
    },
    delete: async (id: string): Promise<void> => {
      await apiClient.delete(`/gallery?id=${id}`)
    },
  },

  requests: {
    getAll: async (): Promise<ServiceRequest[]> => {
      const response = await apiClient.get<ServiceRequest[]>('/requests')
      return response.data
    },
    create: async (request: {
      name: string
      email: string
      phone: string
      service_id?: string
      description: string
      images?: string[]
    }): Promise<ServiceRequest> => {
      const response = await apiClient.post<ServiceRequest>('/requests', request)
      return response.data
    },
    updateStatus: async (id: string, status: ServiceRequest['status']): Promise<ServiceRequest> => {
      const response = await apiClient.put<ServiceRequest>('/requests', { id, status })
      return response.data
    },
  },

  customers: {
    getAll: async (): Promise<Customer[]> => {
      const response = await apiClient.get<Customer[]>('/customers')
      return response.data
    },
    getById: async (id: string): Promise<Customer> => {
      const response = await apiClient.get<Customer>(`/customers?id=${id}`)
      return response.data
    },
  },

  invoices: {
    getAll: async (): Promise<Invoice[]> => {
      const response = await apiClient.get<Invoice[]>('/invoices')
      return response.data
    },
    getById: async (id: string): Promise<Invoice> => {
      const response = await apiClient.get<Invoice>(`/invoices?id=${id}`)
      return response.data
    },
    create: async (invoice: Omit<Invoice, 'id' | 'invoice_number' | 'created_at' | 'updated_at'>): Promise<Invoice> => {
      const response = await apiClient.post<Invoice>('/invoices', invoice)
      return response.data
    },
    update: async (id: string, invoice: Partial<Invoice>): Promise<Invoice> => {
      const response = await apiClient.put<Invoice>('/invoices', { id, ...invoice })
      return response.data
    },
    send: async (id: string): Promise<void> => {
      await apiClient.post('/invoices/send', { id })
    },
  },

  dashboard: {
    getStats: async (): Promise<DashboardStats> => {
      if (!supabaseConfigured) {
        return {
          totalRequests: 24,
          pendingRequests: 5,
          completedProjects: 18,
          totalRevenue: 125000,
          monthlyRevenue: [
            { month: 'Aug 2025', revenue: 15000 },
            { month: 'Sep 2025', revenue: 22000 },
            { month: 'Oct 2025', revenue: 18000 },
            { month: 'Nov 2025', revenue: 25000 },
            { month: 'Dec 2025', revenue: 20000 },
            { month: 'Jan 2026', revenue: 25000 },
          ],
          requestsByStatus: [
            { status: 'pending', count: 5 },
            { status: 'in_progress', count: 3 },
            { status: 'completed', count: 18 },
            { status: 'cancelled', count: 2 },
          ],
        }
      }
      const response = await apiClient.get<DashboardStats>('/dashboard')
      return response.data
    },
  },

  upload: {
    image: async (file: File): Promise<{ url: string; thumbnailUrl: string }> => {
      const formData = new FormData()
      formData.append('file', file)
      const response = await apiClient.post<{ url: string; thumbnailUrl: string }>('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return response.data
    },
  },
}
