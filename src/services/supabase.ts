// Database connection is handled server-side via Netlify Functions
// Frontend uses mock data when database is not available

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

export const isDatabaseConfigured = !!supabaseUrl

if (!isDatabaseConfigured) {
  console.warn('Database not configured. Using mock data.')
}

// Placeholder for compatibility - actual queries go through Netlify Functions
export const supabase = {
  from: () => ({
    select: () => Promise.resolve({ data: [], error: null }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => Promise.resolve({ data: null, error: null }),
    delete: () => Promise.resolve({ error: null }),
  })
}
