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
    // Get total requests
    const totalResult = await query('SELECT COUNT(*) as count FROM requests')
    const totalRequests = parseInt(totalResult.rows[0].count) || 0

    // Get pending requests
    const pendingResult = await query("SELECT COUNT(*) as count FROM requests WHERE status = 'pending'")
    const pendingRequests = parseInt(pendingResult.rows[0].count) || 0

    // Get completed projects
    const completedResult = await query("SELECT COUNT(*) as count FROM requests WHERE status = 'completed'")
    const completedProjects = parseInt(completedResult.rows[0].count) || 0

    // Get total revenue from paid invoices
    const revenueResult = await query("SELECT COALESCE(SUM(total), 0) as total FROM invoices WHERE status = 'paid'")
    const totalRevenue = parseFloat(revenueResult.rows[0].total) || 0

    // Get monthly revenue for the last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyInvoicesResult = await query(
      "SELECT total, created_at FROM invoices WHERE status = 'paid' AND created_at >= $1",
      [sixMonthsAgo.toISOString()]
    )
    const monthlyInvoices = monthlyInvoicesResult.rows

    const monthlyRevenue: { month: string; revenue: number }[] = []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = months[date.getMonth()]
      const year = date.getFullYear()
      
      const monthRevenue = monthlyInvoices?.filter((inv: { total: number; created_at: string }) => {
        const invDate = new Date(inv.created_at)
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === year
      }).reduce((sum: number, inv: { total: number }) => sum + (inv.total || 0), 0) || 0

      monthlyRevenue.push({ month: `${monthName} ${year}`, revenue: monthRevenue })
    }

    // Get requests by status
    const statusResult = await query(`
      SELECT status, COUNT(*) as count FROM requests 
      GROUP BY status
    `)
    const statusCounts = statusResult.rows.reduce((acc: Record<string, number>, row: { status: string; count: string }) => {
      acc[row.status] = parseInt(row.count)
      return acc
    }, {})
    
    const statuses = ['pending', 'in_progress', 'completed', 'cancelled']
    const requestsByStatus = statuses.map(status => ({
      status,
      count: statusCounts[status] || 0
    }))

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
