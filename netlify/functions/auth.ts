import type { Handler } from '@netlify/functions'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'tamam'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}')

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, token }),
      }
    }

    return {
      statusCode: 401,
      body: JSON.stringify({ success: false, error: 'Invalid credentials' }),
    }
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }
  }
}
