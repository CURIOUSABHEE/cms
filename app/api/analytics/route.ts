import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const tickets = await prisma.ticket.findMany({
      include: {
        category: true,
        agent: true
      }
    })

    const total = tickets.length
    const byStatus = {
      Open: tickets.filter(t => t.status === 'OPEN').length,
      InProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      Resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      Closed: tickets.filter(t => t.status === 'CLOSED').length,
    }

    const byPriority = {
      Low: tickets.filter(t => t.priority === 'LOW').length,
      Medium: tickets.filter(t => t.priority === 'MEDIUM').length,
      High: tickets.filter(t => t.priority === 'HIGH').length,
    }

    // Tickets by category name
    const byCategory: Record<string, number> = {}
    // Tickets by agent name
    const byAgent: Record<string, number> = {}

    tickets.forEach(t => {
      const catName = t.category.name
      byCategory[catName] = (byCategory[catName] || 0) + 1

      if (t.agent) {
        const agentName = t.agent.name
        byAgent[agentName] = (byAgent[agentName] || 0) + 1
      } else {
        byAgent['Unassigned'] = (byAgent['Unassigned'] || 0) + 1
      }
    })

    // Tickets per day for last 7 days
    const last7Days: Record<string, { created: number; resolved: number }> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days[d.toISOString().split('T')[0]] = { created: 0, resolved: 0 }
    }

    tickets.forEach(t => {
      const createdDay = t.createdAt.toISOString().split('T')[0]
      if (last7Days[createdDay] !== undefined) {
        last7Days[createdDay].created++
      }

      if (t.status === 'CLOSED') {
        const resolvedDay = t.updatedAt.toISOString().split('T')[0]
        if (last7Days[resolvedDay] !== undefined) {
          last7Days[resolvedDay].resolved++
        }
      }
    })

    // Compute trends: compare last 7 days vs previous 7 days
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const totalRecent = tickets.filter(t => t.createdAt >= sevenDaysAgo).length
    const totalPrevious = tickets.filter(t => t.createdAt >= fourteenDaysAgo && t.createdAt < sevenDaysAgo).length
    const totalTrend = totalPrevious > 0
      ? Math.round(((totalRecent - totalPrevious) / totalPrevious) * 100)
      : (totalRecent > 0 ? 100 : 0)

    const closedRecent = tickets.filter(t => t.status === 'CLOSED' && t.updatedAt >= sevenDaysAgo).length
    const closedPrevious = tickets.filter(t => t.status === 'CLOSED' && t.updatedAt >= fourteenDaysAgo && t.updatedAt < sevenDaysAgo).length
    const closedTrend = closedPrevious > 0
      ? Math.round(((closedRecent - closedPrevious) / closedPrevious) * 100)
      : (closedRecent > 0 ? 100 : 0)

    const activeRecent = tickets.filter(t => (t.status === 'IN_PROGRESS' || t.status === 'OPEN') && t.updatedAt >= sevenDaysAgo).length
    const activePrevious = tickets.filter(t => (t.status === 'IN_PROGRESS' || t.status === 'OPEN') && t.updatedAt >= fourteenDaysAgo && t.updatedAt < sevenDaysAgo).length
    const activeTrend = activePrevious > 0
      ? Math.round(((activeRecent - activePrevious) / activePrevious) * 100)
      : (activeRecent > 0 ? 100 : 0)

    const openRecent = tickets.filter(t => t.status === 'OPEN' && t.createdAt >= sevenDaysAgo).length
    const openPrevious = tickets.filter(t => t.status === 'OPEN' && t.createdAt >= fourteenDaysAgo && t.createdAt < sevenDaysAgo).length
    const openTrend = openPrevious > 0
      ? Math.round(((openRecent - openPrevious) / openPrevious) * 100)
      : (openRecent > 0 ? 100 : 0)

    // Compute average resolution time in hours
    const resolvedTickets = tickets.filter(t => (t.status === 'RESOLVED' || t.status === 'CLOSED') && t.closedAt)
    let avgResolutionTimeHours = 0
    if (resolvedTickets.length > 0) {
      const totalTimeMs = resolvedTickets.reduce((acc, t) => {
        return acc + (t.closedAt!.getTime() - t.createdAt.getTime())
      }, 0)
      avgResolutionTimeHours = Math.round((totalTimeMs / (1000 * 60 * 60)) / resolvedTickets.length * 10) / 10
    }

    // Agent performance (tickets resolved per agent)
    const performanceData: Record<string, number> = {}
    resolvedTickets.forEach(t => {
      if (t.agent) {
        performanceData[t.agent.name] = (performanceData[t.agent.name] || 0) + 1
      }
    })
    const agentPerformance = Object.entries(performanceData).map(([name, resolvedCount]) => ({
      name,
      resolvedCount
    })).sort((a, b) => b.resolvedCount - a.resolvedCount)

    return NextResponse.json({
      total,
      byStatus,
      byPriority,
      byCategory,
      byAgent,
      ticketsPerDay: Object.entries(last7Days).map(([date, data]) => ({
        date,
        created: data.created,
        resolved: data.resolved
      })),
      avgResolutionTimeHours,
      agentPerformance,
      trends: {
        total: totalTrend,
        closed: closedTrend,
        inProgress: activeTrend,
        open: openTrend
      }
    })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
