import type { Handler } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

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
          const { data, error } = await supabase
            .from('services')
            .select('*')
            .eq('id', id)
            .single()
          if (error) throw error
          return { statusCode: 200, headers, body: JSON.stringify(data) }
        }
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      case 'POST': {
        const body = JSON.parse(event.body || '{}')
        const { data, error } = await supabase
          .from('services')
          .insert([body])
          .select()
          .single()
        if (error) throw error
        return { statusCode: 201, headers, body: JSON.stringify(data) }
      }

      case 'PUT': {
        const body = JSON.parse(event.body || '{}')
        const { id, ...updates } = body
        const { data, error } = await supabase
          .from('services')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()
        if (error) throw error
        return { statusCode: 200, headers, body: JSON.stringify(data) }
      }

      case 'DELETE': {
        const id = event.queryStringParameters?.id
        if (!id) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'ID required' }) }
        }
        const { error } = await supabase.from('services').delete().eq('id', id)
        if (error) throw error
        return { statusCode: 204, headers, body: '' }
      }

      default:
        return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
    }
  } catch (error) {
    console.error('Services error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
