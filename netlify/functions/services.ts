import type { Handler } from '@netlify/functions'
import { query } from './utils/db'

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  try {
    switch (event.httpMethod) {
      case 'GET': {
        const id = event.queryStringParameters?.id
        if (id) {
          const result = await query('SELECT * FROM services WHERE id = $1', [id])
          return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
        }
        const result = await query(
          'SELECT * FROM services WHERE is_active = true ORDER BY created_at DESC'
        )
        return { statusCode: 200, headers, body: JSON.stringify(result.rows) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        const { name_en, name_he, description_en, description_he, price_from, price_to, image_url, is_active } = body
        const result = await query(
          `INSERT INTO services (name_en, name_he, description_en, description_he, price_from, price_to, image_url, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [name_en, name_he, description_en, description_he, price_from, price_to, image_url, is_active ?? true]
        )
        return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, name_en, name_he, description_en, description_he, price_from, price_to, image_url, is_active } = body
        const result = await query(
          `UPDATE services SET name_en = $1, name_he = $2, description_en = $3, description_he = $4,
           price_from = $5, price_to = $6, image_url = $7, is_active = $8, updated_at = NOW()
           WHERE id = $9 RETURNING *`,
          [name_en, name_he, description_en, description_he, price_from, price_to, image_url, is_active, id]
        )
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
      }

      case 'DELETE': {
        const id = event.queryStringParameters?.id
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) }
        }
        await query('DELETE FROM services WHERE id = $1', [id])
        return { statusCode: 204, headers, body: '' }
      }

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  } catch (error: any) {
    console.error('Services error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message || 'Internal server error', stack: error.stack }) }
  }
}
