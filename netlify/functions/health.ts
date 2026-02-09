import type { Handler } from '@netlify/functions'

export const handler: Handler = async () => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  }

  // Step 1: Check if function runs at all
  const checks: Record<string, string> = {
    function_running: 'yes',
    database_url_set: process.env.DATABASE_URL ? 'yes' : 'NO - MISSING',
    node_version: process.version,
  }

  // Step 2: Try importing postgres
  try {
    const postgres = (await import('postgres')).default
    checks.postgres_import = 'success'

    // Step 3: Try connecting
    if (process.env.DATABASE_URL) {
      const sql = postgres(process.env.DATABASE_URL, {
        ssl: 'require',
        max: 1,
        connect_timeout: 5,
      })
      const result = await sql`SELECT 1 as test`
      checks.db_connection = 'success'
      checks.db_result = JSON.stringify(result)
      await sql.end()
    }
  } catch (error: any) {
    checks.error = error.message
    checks.error_stack = error.stack
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(checks, null, 2),
  }
}
