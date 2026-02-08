import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  LayoutDashboard, Image, Wrench, FileText, MessageSquare, 
  LogOut, Plus, Loader2, X, Send, Download, Trash2 
} from 'lucide-react'
import toast from 'react-hot-toast'
import jsPDF from 'jspdf'
import { useLanguage } from '../../contexts/LanguageContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../services/api'
import type { Invoice, Customer, InvoiceItem } from '../../types'

export default function AdminInvoices() {
  const { t } = useLanguage()
  const { logout } = useAuth()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: '',
    items: [{ description: '', quantity: 1, unit_price: 0 }] as Omit<InvoiceItem, 'id' | 'invoice_id' | 'total'>[],
    tax: 17,
    due_date: '',
    notes: '',
  })

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: api.invoices.getAll,
  })

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: api.customers.getAll,
  })

  const createMutation = useMutation({
    mutationFn: api.invoices.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice created')
      closeModal()
    },
    onError: () => toast.error('Failed to create invoice'),
  })

  const sendMutation = useMutation({
    mutationFn: api.invoices.send,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Invoice sent to customer')
    },
    onError: () => toast.error('Failed to send invoice'),
  })

  const sidebarLinks = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: t('admin.dashboard') },
    { path: '/admin/gallery', icon: Image, label: t('admin.gallery') },
    { path: '/admin/services', icon: Wrench, label: t('admin.services') },
    { path: '/admin/invoices', icon: FileText, label: t('admin.invoices') },
    { path: '/admin/requests', icon: MessageSquare, label: t('admin.requests') },
  ]

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({
      customer_id: '',
      items: [{ description: '', quantity: 1, unit_price: 0 }],
      tax: 17,
      due_date: '',
      notes: '',
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unit_price: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * (formData.tax / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subtotal = calculateSubtotal()
    const tax = calculateTax()
    const total = calculateTotal()
    
    createMutation.mutate({
      customer_id: formData.customer_id,
      items: formData.items.map(item => ({
        ...item,
        id: '',
        invoice_id: '',
        total: item.quantity * item.unit_price,
      })),
      subtotal,
      tax,
      total,
      status: 'draft',
      due_date: formData.due_date,
      notes: formData.notes,
    })
  }

  const generatePDF = (invoice: Invoice) => {
    const doc = new jsPDF()
    
    doc.setFontSize(24)
    doc.text('Tamam Timber Magic', 20, 30)
    
    doc.setFontSize(12)
    doc.text(`Invoice #${invoice.invoice_number}`, 20, 45)
    doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 20, 52)
    doc.text(`Due: ${new Date(invoice.due_date).toLocaleDateString()}`, 20, 59)
    
    if (invoice.customer) {
      doc.text(`Customer: ${invoice.customer.name}`, 20, 73)
      doc.text(`Email: ${invoice.customer.email}`, 20, 80)
    }
    
    let y = 100
    doc.setFontSize(10)
    doc.text('Description', 20, y)
    doc.text('Qty', 100, y)
    doc.text('Price', 120, y)
    doc.text('Total', 160, y)
    
    y += 10
    invoice.items.forEach(item => {
      doc.text(item.description, 20, y)
      doc.text(item.quantity.toString(), 100, y)
      doc.text(`₪${item.unit_price}`, 120, y)
      doc.text(`₪${item.total}`, 160, y)
      y += 8
    })
    
    y += 10
    doc.text(`Subtotal: ₪${invoice.subtotal}`, 140, y)
    y += 8
    doc.text(`Tax: ₪${invoice.tax}`, 140, y)
    y += 8
    doc.setFontSize(12)
    doc.text(`Total: ₪${invoice.total}`, 140, y)
    
    doc.save(`invoice-${invoice.invoice_number}.pdf`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700'
      case 'sent': return 'bg-blue-100 text-blue-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-600'
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
          <h1 className="text-2xl font-bold text-gray-900">{t('admin.invoices')}</h1>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Invoice
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-wood-600" />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-gray-600">Invoice #</th>
                  <th className="text-left p-4 font-medium text-gray-600">Customer</th>
                  <th className="text-left p-4 font-medium text-gray-600">Total</th>
                  <th className="text-left p-4 font-medium text-gray-600">Status</th>
                  <th className="text-left p-4 font-medium text-gray-600">Date</th>
                  <th className="text-right p-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.map((invoice: Invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-4 font-medium">{invoice.invoice_number}</td>
                    <td className="p-4">{invoice.customer?.name || 'N/A'}</td>
                    <td className="p-4">₪{invoice.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="p-4">{new Date(invoice.created_at).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => generatePDF(invoice)}
                        className="p-2 text-wood-600 hover:bg-wood-100 rounded"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {invoice.status === 'draft' && (
                        <button
                          onClick={() => sendMutation.mutate(invoice.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded ml-2"
                          title="Send to customer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Create Invoice</h2>
                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                      required
                      className="input-field"
                    >
                      <option value="">Select customer</option>
                      {customers?.map((customer: Customer) => (
                        <option key={customer.id} value={customer.id}>{customer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Items</label>
                    <button type="button" onClick={addItem} className="text-sm text-wood-600 hover:text-wood-700">
                      + Add Item
                    </button>
                  </div>
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          required
                          className="input-field flex-1"
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                          min="1"
                          required
                          className="input-field w-20"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={item.unit_price}
                          onChange={(e) => updateItem(index, 'unit_price', Number(e.target.value))}
                          min="0"
                          required
                          className="input-field w-28"
                        />
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax (%)</label>
                    <input
                      type="number"
                      value={formData.tax}
                      onChange={(e) => setFormData({ ...formData, tax: Number(e.target.value) })}
                      min="0"
                      max="100"
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>₪{calculateSubtotal().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Tax ({formData.tax}%):</span>
                    <span>₪{calculateTax().toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                    <span>Total:</span>
                    <span>₪{calculateTotal().toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-4">
                  <button type="button" onClick={closeModal} className="btn-outline">
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="btn-primary"
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : 'Create Invoice'}
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
