export interface Service {
  id: string
  name_en: string
  name_he: string
  description_en: string
  description_he: string
  price_from: number
  price_to: number | null
  image_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface GalleryItem {
  id: string
  title_en: string
  title_he: string
  description_en: string
  description_he: string
  image_url: string
  thumbnail_url: string
  category: string
  is_featured: boolean
  created_at: string
}

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address?: string
  created_at: string
}

export interface ServiceRequest {
  id: string
  customer_id: string
  customer?: Customer
  service_id?: string
  service?: Service
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer?: Customer
  items: InvoiceItem[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'cancelled'
  due_date: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface DashboardStats {
  totalRequests: number
  pendingRequests: number
  completedProjects: number
  totalRevenue: number
  monthlyRevenue: { month: string; revenue: number }[]
  requestsByStatus: { status: string; count: number }[]
}

export type Language = 'en' | 'he'

export interface Translation {
  [key: string]: string | Translation
}
