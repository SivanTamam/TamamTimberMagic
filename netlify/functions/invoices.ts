import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const RESEND_API_KEY = process.env.RESEND_API_KEY
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sivantamam.uk@gmail.com'

function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${random}`
}

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const id = event.queryStringParameters?.id
        if (id) {
          const { data, error } = await supabase
            .from('invoices')
            .select('*, customer:customers(*), items:invoice_items(*)')
            .eq('id', id)
            .single()
          if (error) throw error
          return { statusCode: 200, headers, body: JSON.stringify(data) }
        }
        const { data, error } = await supabase
          .from('invoices')
          .select('*, customer:customers(*), items:invoice_items(*)')
          .order('created_at', { ascending: false })
        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        
        // Check if this is a send request
        if (event.path?.includes('/send')) {
          const { id } = body
          const { data: invoice, error: fetchError } = await supabase
            .from('invoices')
            .select('*, customer:customers(*), items:invoice_items(*)')
            .eq('id', id)
            .single()
          if (fetchError) throw fetchError

          // Update status to sent
          await supabase
            .from('invoices')
            .update({ status: 'sent', updated_at: new Date().toISOString() })
            .eq('id', id)

          // Build invoice items HTML
          const itemsHtml = invoice.items?.map((item: { description: string; quantity: number; unit_price: number; total: number }) => 
            `<tr><td>${item.description}</td><td>${item.quantity}</td><td>₪${item.unit_price}</td><td>₪${item.total}</td></tr>`
          ).join('') || ''

          const invoiceHtml = `
            <h2>Invoice ${invoice.invoice_number}</h2>
            <p>Dear ${invoice.customer?.name || 'Customer'},</p>
            <p>Please find your invoice details below:</p>
            <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr style="background-color: #f3f4f6;">
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr><td colspan="3" align="right"><strong>Subtotal:</strong></td><td>₪${invoice.subtotal}</td></tr>
                <tr><td colspan="3" align="right"><strong>Tax:</strong></td><td>₪${invoice.tax}</td></tr>
                <tr style="background-color: #f3f4f6;"><td colspan="3" align="right"><strong>Total:</strong></td><td><strong>₪${invoice.total}</strong></td></tr>
              </tfoot>
            </table>
            <p><strong>Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</strong></p>
            ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}
            <p>Thank you for your business!</p>
            <p>Best regards,<br>Tamam Timber Magic</p>
          `

          // Send email to customer
          if (RESEND_API_KEY && invoice.customer?.email) {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Tamam Timber Magic <noreply@timbermagic.com>',
                to: invoice.customer.email,
                cc: ADMIN_EMAIL,
                subject: `Invoice ${invoice.invoice_number} - Tamam Timber Magic`,
                html: invoiceHtml,
              }),
            })
          }

          return { statusCode: 200, headers, body: JSON.stringify({ success: true }) }
        }

        // Create new invoice
        const { customer_id, items, subtotal, tax, total, status, due_date, notes } = body
        const invoice_number = generateInvoiceNumber()

        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .insert([{
            invoice_number,
            customer_id,
            subtotal,
            tax,
            total,
            status,
            due_date,
            notes,
          }])
          .select()
          .single()
        if (invoiceError) throw invoiceError

        // Insert invoice items
        if (items && items.length > 0) {
          const itemsWithInvoiceId = items.map((item: { description: string; quantity: number; unit_price: number }) => ({
            invoice_id: invoice.id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            total: item.quantity * item.unit_price,
          }))
          await supabase.from('invoice_items').insert(itemsWithInvoiceId)
        }

        const { data: fullInvoice } = await supabase
          .from('invoices')
          .select('*, customer:customers(*), items:invoice_items(*)')
          .eq('id', invoice.id)
          .single()

        return { statusCode: 201, headers, body: JSON.stringify(fullInvoice) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, ...updates } = body
        const { data, error } = await supabase
          .from('invoices')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('*, customer:customers(*), items:invoice_items(*)')
          .single()
        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  } catch (error) {
    console.error('Invoices error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
