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
        const featured = event.queryStringParameters?.featured === 'true'
        const sql = featured
          ? 'SELECT * FROM gallery WHERE is_featured = true ORDER BY created_at DESC'
          : 'SELECT * FROM gallery ORDER BY created_at DESC'
        const result = await query(sql)
        return { statusCode: 200, headers, body: JSON.stringify(result.rows) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        const { title_en, title_he, description_en, description_he, image_url, thumbnail_url, category, is_featured } = body
        const result = await query(
          `INSERT INTO gallery (title_en, title_he, description_en, description_he, image_url, thumbnail_url, category, is_featured)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
          [title_en, title_he, description_en, description_he, image_url, thumbnail_url, category, is_featured ?? false]
        )
        return { statusCode: 201, headers, body: JSON.stringify(result.rows[0]) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, title_en, title_he, description_en, description_he, image_url, thumbnail_url, category, is_featured } = body
        const result = await query(
          `UPDATE gallery SET title_en = $1, title_he = $2, description_en = $3, description_he = $4,
           image_url = $5, thumbnail_url = $6, category = $7, is_featured = $8
           WHERE id = $9 RETURNING *`,
          [title_en, title_he, description_en, description_he, image_url, thumbnail_url, category, is_featured, id]
        )
        return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
      }

      case 'DELETE': {
        const id = event.queryStringParameters?.id
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) }
        }
        await query('DELETE FROM gallery WHERE id = $1', [id])
        return { statusCode: 204, headers, body: '' }
      }

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  } catch (error) {
    console.error('Gallery error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
