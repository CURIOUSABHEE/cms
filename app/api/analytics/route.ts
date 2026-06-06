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
      WaitingForCustomer: tickets.filter(t => t.status === 'WAITING_FOR_CUSTOMER').length,
      Resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      Closed: tickets.filter(t => t.status === 'CLOSED').length,
    }

    const byPriority = {
      Low: tickets.filter(t => t.priority === 'LOW').length,
      Medium: tickets.filter(t => t.priority === 'MEDIUM').length,
      High: tickets.filter(t => t.priority === 'HIGH').length,
      Critical: tickets.filter(t => t.priority === 'CRITICAL').length,
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
    const last7Days: Record<string, number> = {}
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      last7Days[d.toISOString().split('T')[0]] = 0
    }

    tickets.forEach(t => {
      const day = t.createdAt.toISOString().split('T')[0]
      if (last7Days[day] !== undefined) {
        last7Days[day]++
      }
    })

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
      ticketsPerDay: Object.entries(last7Days).map(([date, count]) => ({ date, count })),
      avgResolutionTimeHours,
      agentPerformance
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
