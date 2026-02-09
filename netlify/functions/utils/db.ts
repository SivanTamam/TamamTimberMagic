import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL || '', {
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
})

export async function query(text: string, params?: unknown[]) {
  // postgres.js uses tagged template literals, but we need to support
  // parameterized queries ($1, $2, etc.) for compatibility
  if (!params || params.length === 0) {
    const result = await sql.unsafe(text)
    return { rows: result }
  }
  const result = await sql.unsafe(text, params as any[])
  return { rows: result }
}

export default sql
