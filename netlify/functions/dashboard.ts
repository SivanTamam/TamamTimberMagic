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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    // Get total requests
    const { count: totalRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })

    // Get pending requests
    const { count: pendingRequests } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    // Get completed projects
    const { count: completedProjects } = await supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')

    // Get total revenue from paid invoices
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total')
      .eq('status', 'paid')

    const totalRevenue = invoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const { data: monthlyInvoices } = await supabase
      .from('invoices')
      .select('total, created_at')
      .eq('status', 'paid')
      .gte('created_at', sixMonthsAgo.toISOString())

    const monthlyRevenue: { month: string; revenue: number }[] = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = months[date.getMonth()]
      const year = date.getFullYear()
      
      const monthRevenue = monthlyInvoices?.filter(inv => {
        const invDate = new Date(inv.created_at)
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === year
      }).reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

      monthlyRevenue.push({ month: `${monthName} ${year}`, revenue: monthRevenue })
    }

    // Get requests by status
    const statuses = ['pending', 'in_progress', 'completed', 'cancelled']
    const requestsByStatus: { status: string; count: number }[] = []
    
    for (const status of statuses) {
      const { count } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', status)
      requestsByStatus.push({ status, count: count || 0 })
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        completedProjects: completedProjects || 0,
        totalRevenue,
        monthlyRevenue,
        requestsByStatus,
      }),
    }
  } catch (error) {
    console.error('Dashboard error:', error)
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal server error' }) }
  }
}
