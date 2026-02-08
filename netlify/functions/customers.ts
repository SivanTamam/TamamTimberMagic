import type { Handler } from '@netlify/functions'
import { query } from './utils/db'

export const handler: Handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const id = event.queryStringParameters?.id
    if (id) {
      const result = await query('SELECT * FROM customers WHERE id = $1', [id])
      return { statusCode: 200, headers, body: JSON.stringify(result.rows[0]) }
    }

    const result = await query('SELECT * FROM customers ORDER BY created_at DESC')
    return { statusCode: 200, headers, body: JSON.stringify(result.rows) }
  } catch (error) {
    console.error('Customers error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
