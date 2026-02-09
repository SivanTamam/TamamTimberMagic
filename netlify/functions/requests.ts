import type { Handler } from '@netlify/functions'
import { query } from './utils/db'
import { sendEmail } from './utils/email'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'sivantamam.uk@gmail.com'

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
        const result = await query(`
          SELECT r.*, 
            json_build_object('id', c.id, 'name', c.name, 'email', c.email, 'phone', c.phone) as customer,
            json_build_object('id', s.id, 'name_en', s.name_en, 'name_he', s.name_he) as service
          FROM requests r
          LEFT JOIN customers c ON r.customer_id = c.id
          LEFT JOIN services s ON r.service_id = s.id
          ORDER BY r.created_at DESC
        `)
        return { statusCode: 200, headers, body: JSON.stringify(result.rows) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        const { name, email, phone, service_id, description, images } = body

        // Create or find customer
        let customerId: string
        const existingCustomer = await query(
          'SELECT id FROM customers WHERE email = $1',
          [email]
        )

        if (existingCustomer.rows.length > 0) {
          customerId = existingCustomer.rows[0].id
        } else {
          const newCustomer = await query(
            'INSERT INTO customers (name, email, phone) VALUES ($1, $2, $3) RETURNING id',
            [name, email, phone]
          )
          customerId = newCustomer.rows[0].id
        }

        // Create request
        const requestResult = await query(
          `INSERT INTO requests (customer_id, service_id, description, status) 
           VALUES ($1, $2, $3, 'pending') RETURNING *`,
          [customerId, service_id || null, description]
        )
        const request = requestResult.rows[0]

        // Send email notification to admin
        try {
          // Build inspiration images HTML and attachments
          let imagesHtml = ''
          const attachments: { filename: string; content: string; encoding: string }[] = []
          
          if (images && Array.isArray(images) && images.length > 0) {
            imagesHtml = '<h3>Inspiration Images:</h3>'
            images.forEach((img: string, index: number) => {
              const matches = img.match(/^data:(.+);base64,(.+)$/)
              if (matches) {
                const contentType = matches[1]
                const base64Content = matches[2]
                const ext = contentType.split('/')[1] || 'jpg'
                const filename = `inspiration-${index + 1}.${ext}`
                
                attachments.push({
                  filename,
                  content: base64Content,
                  encoding: 'base64',
                })
                
                imagesHtml += `<p><strong>${filename}</strong> (attached)</p>`
              }
            })
          }

          await sendEmail({
            to: ADMIN_EMAIL,
            subject: `New Quote Request from ${name}${images?.length ? ` (${images.length} images)` : ''}`,
            html: `
              <h2>New Quote Request</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
              <p><strong>Description:</strong></p>
              <p>${description}</p>
              ${imagesHtml}
            `,
            attachments: attachments.length > 0 ? attachments : undefined,
          })
        } catch (emailError) {
          console.error('Failed to send admin email:', emailError)
        }

        // Send confirmation email to customer
        try {
          await sendEmail({
            to: email,
            subject: 'Thank you for your request - Tamam Timber Magic',
            html: `
              <h2>Thank you for your request!</h2>
              <p>Dear ${name},</p>
              <p>We have received your quote request and will get back to you shortly.</p>
              <p>Best regards,<br>Tamam Timber Magic</p>
            `,
          })
        } catch (emailError) {
          console.error('Failed to send confirmation email:', emailError)
        }

        return { statusCode: 201, headers, body: JSON.stringify(request) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, status } = body
        const result = await query(
          `UPDATE requests SET status = $1, updated_at = NOW() WHERE id = $2
           RETURNING *`,
          [status, id]
        )
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
      }

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  } catch (error) {
    console.error('Requests error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
