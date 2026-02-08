import type { Handler } from '@netlify/functions'
import { query } from './utils/db'

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
          const invoiceResult = await query('SELECT * FROM invoices WHERE id = $1', [id])
          const invoice = invoiceResult.rows[0]
          if (invoice) {
            const customerResult = await query('SELECT * FROM customers WHERE id = $1', [invoice.customer_id])
            const itemsResult = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id])
            invoice.customer = customerResult.rows[0] || null
            invoice.items = itemsResult.rows
          }
          return { statusCode: 200, headers, body: JSON.stringify(invoice) }
        }
        const invoicesResult = await query('SELECT * FROM invoices ORDER BY created_at DESC')
        const invoices = invoicesResult.rows
        for (const inv of invoices) {
          const customerResult = await query('SELECT * FROM customers WHERE id = $1', [inv.customer_id])
          const itemsResult = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [inv.id])
          inv.customer = customerResult.rows[0] || null
          inv.items = itemsResult.rows
        }
        return { statusCode: 200, headers, body: JSON.stringify(invoices) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        
        // Check if this is a send request
        if (event.path?.includes('/send')) {
          const { id } = body
          const invoiceResult = await query('SELECT * FROM invoices WHERE id = $1', [id])
          const invoice = invoiceResult.rows[0]
          if (!invoice) throw new Error('Invoice not found')
          
          const customerResult = await query('SELECT * FROM customers WHERE id = $1', [invoice.customer_id])
          const itemsResult = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id])
          invoice.customer = customerResult.rows[0] || null
          invoice.items = itemsResult.rows

          // Update status to sent
          await query("UPDATE invoices SET status = 'sent', updated_at = NOW() WHERE id = $1", [id])

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

        const invoiceResult = await query(
          `INSERT INTO invoices (invoice_number, customer_id, subtotal, tax, total, status, due_date, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [invoice_number, customer_id, subtotal, tax, total, status || 'draft', due_date, notes]
        )
        const invoice = invoiceResult.rows[0]

        // Insert invoice items
        if (items && items.length > 0) {
          for (const item of items as { description: string; quantity: number; unit_price: number }[]) {
            await query(
              `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total)
               VALUES ($1, $2, $3, $4, $5)`,
              [invoice.id, item.description, item.quantity, item.unit_price, item.quantity * item.unit_price]
            )
          }
        }

        // Fetch full invoice with customer and items
        const customerResult = await query('SELECT * FROM customers WHERE id = $1', [customer_id])
        const itemsResult = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [invoice.id])
        invoice.customer = customerResult.rows[0] || null
        invoice.items = itemsResult.rows

        return { statusCode: 201, headers, body: JSON.stringify(invoice) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, status, subtotal, tax, total, due_date, notes } = body
        const result = await query(
          `UPDATE invoices SET status = COALESCE($1, status), subtotal = COALESCE($2, subtotal),
           tax = COALESCE($3, tax), total = COALESCE($4, total), due_date = COALESCE($5, due_date),
           notes = COALESCE($6, notes), updated_at = NOW()
           WHERE id = $7 RETURNING *`,
          [status, subtotal, tax, total, due_date, notes, id]
        )
        const invoice = result.rows[0]
        if (invoice) {
          const customerResult = await query('SELECT * FROM customers WHERE id = $1', [invoice.customer_id])
          const itemsResult = await query('SELECT * FROM invoice_items WHERE invoice_id = $1', [id])
          invoice.customer = customerResult.rows[0] || null
          invoice.items = itemsResult.rows
        }
        return { statusCode: 200, headers, body: JSON.stringify(invoice) }
      }

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  } catch (error) {
    console.error('Invoices error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
