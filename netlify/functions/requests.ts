import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

const RESEND_API_KEY = process.env.RESEND_API_KEY
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
        const { data, error } = await supabase
          .from('requests')
          .select('*, customer:customers(*), service:services(*)')
          .order('created_at', { ascending: false })
        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        const { name, email, phone, service_id, description, images } = body

        // Create or find customer
        let customerId: string
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('id')
          .eq('email', email)
          .single()

        if (existingCustomer) {
          customerId = existingCustomer.id
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from('customers')
            .insert([{ name, email, phone }])
            .select()
            .single()
          if (customerError) throw customerError
          customerId = newCustomer.id
        }

        // Create request
        const { data: request, error: requestError } = await supabase
          .from('requests')
          .insert([{
            customer_id: customerId,
            service_id: service_id || null,
            description,
            status: 'pending',
          }])
          .select('*, customer:customers(*), service:services(*)')
          .single()
        if (requestError) throw requestError

        // Send email notification to admin
        if (RESEND_API_KEY) {
          try {
            // Build inspiration images HTML
            let imagesHtml = ''
            const attachments: { filename: string; content: string }[] = []
            
            if (images && Array.isArray(images) && images.length > 0) {
              imagesHtml = '<h3>Inspiration Images:</h3><div style="display: flex; flex-wrap: wrap; gap: 10px;">'
              images.forEach((img: string, index: number) => {
                // Extract base64 content and content type
                const matches = img.match(/^data:(.+);base64,(.+)$/)
                if (matches) {
                  const contentType = matches[1]
                  const base64Content = matches[2]
                  const ext = contentType.split('/')[1] || 'jpg'
                  const filename = `inspiration-${index + 1}.${ext}`
                  
                  attachments.push({
                    filename,
                    content: base64Content,
                  })
                  
                  // Add inline image to HTML
                  imagesHtml += `<img src="${img}" alt="Inspiration ${index + 1}" style="max-width: 300px; max-height: 300px; object-fit: cover; border-radius: 8px;" />`
                }
              })
              imagesHtml += '</div>'
            }

            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Tamam Timber Magic <noreply@timbermagic.com>',
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
              }),
            })
          } catch (emailError) {
            console.error('Failed to send email:', emailError)
          }
        }

        // Send confirmation email to customer
        if (RESEND_API_KEY) {
          try {
            await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                from: 'Tamam Timber Magic <noreply@timbermagic.com>',
                to: email,
                subject: 'Thank you for your request - Tamam Timber Magic',
                html: `
                  <h2>Thank you for your request!</h2>
                  <p>Dear ${name},</p>
                  <p>We have received your quote request and will get back to you shortly.</p>
                  <p>Best regards,<br>Tamam Timber Magic</p>
                `,
              }),
            })
          } catch (emailError) {
            console.error('Failed to send confirmation email:', emailError)
          }
        }

        return { statusCode: 201, headers, body: JSON.stringify(request) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, status } = body
        const { data, error } = await supabase
          .from('requests')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select('*, customer:customers(*), service:services(*)')
          .single()
        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  } catch (error) {
    console.error('Requests error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
