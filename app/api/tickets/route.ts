import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const categoryId = searchParams.get('categoryId')
    const agentId = searchParams.get('agentId')
    const search = searchParams.get('search')
    const fromDate = searchParams.get('fromDate')
    const toDate = searchParams.get('toDate')
    const pageStr = searchParams.get('page')
    const limitStr = searchParams.get('limit')

    const where: any = {}

    // Enforce role-based access
    if (session.role === 'CUSTOMER') {
      where.customerId = session.id
    } else {
      // Staff/Admins can filter by agent
      if (agentId) {
        where.assignedAgentId = agentId === 'unassigned' ? null : agentId
      }
    }

    if (status) {
      // Map frontend status values (e.g. "In Progress", "open") to database Status enums
      const statusMap: Record<string, string> = {
        'open': 'OPEN',
        'in progress': 'IN_PROGRESS',
        'in_progress': 'IN_PROGRESS',
        'waiting for customer': 'IN_PROGRESS',
        'waiting_for_customer': 'IN_PROGRESS',
        'resolved': 'RESOLVED',
        'closed': 'CLOSED'
      }
      const mappedStatus = statusMap[status.toLowerCase()] || status.toUpperCase()
      where.status = mappedStatus as any
    }

    if (priority) {
      // Map frontend priority values (e.g. "Urgent", "high") to database Priority enums
      const priorityMap: Record<string, string> = {
        'low': 'LOW',
        'medium': 'MEDIUM',
        'high': 'HIGH',
        'urgent': 'HIGH',
        'critical': 'HIGH'
      }
      const mappedPriority = priorityMap[priority.toLowerCase()] || priority.toUpperCase()
      where.priority = mappedPriority as any
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (fromDate || toDate) {
      where.createdAt = {}
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate)
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate)
      }
    }

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { agent: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Paginated query if page parameter is provided
    if (pageStr) {
      const page = Math.max(1, parseInt(pageStr || '1') || 1)
      const limit = Math.max(1, parseInt(limitStr || '10') || 10)
      const skip = (page - 1) * limit

      const [tickets, total] = await Promise.all([
        prisma.ticket.findMany({
          where,
          include: {
            customer: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            },
            agent: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            },
            category: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.ticket.count({ where })
      ])

      const mapped = tickets.map(t => ({
        ...t,
        ticket_id: t.id,
        ticket_number: t.ticketNumber,
        customer_name: t.customer?.name || 'Unknown',
        customer_email: t.customer?.email || '',
        created_at: t.createdAt.toISOString(),
      }))

      return NextResponse.json({
        tickets: mapped,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      })
    }

    // Default/fallback bounded query (limit to 100 to prevent unbounded loading)
    const limit = limitStr ? Math.max(1, parseInt(limitStr || '100') || 100) : 100
    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        agent: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    })

    const mapped = tickets.map(t => ({
      ...t,
      ticket_id: t.id,
      ticket_number: t.ticketNumber,
      customer_name: t.customer?.name || 'Unknown',
      customer_email: t.customer?.email || '',
      created_at: t.createdAt.toISOString(),
    }))

    return NextResponse.json(mapped)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, description, priority, categoryId, customerEmail, attachments } = body

    if (!subject || !description || !categoryId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    let targetCustomerId = session.id

    // Staff/Admin can create ticket on behalf of a customer
    if (session.role !== 'CUSTOMER' && customerEmail) {
      const customer = await prisma.user.findUnique({
        where: { email: customerEmail.toLowerCase().trim() }
      })
      if (!customer) {
        return NextResponse.json({ error: 'Customer with this email does not exist' }, { status: 404 })
      }
      targetCustomerId = customer.id
    }

    // Generate unique sequential ticket number
    const count = await prisma.ticket.count()
    const ticketNumber = `TKT-${String(count + 1).padStart(3, '0')}`

    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        customerId: targetCustomerId,
        subject,
        description,
        priority: session.role === 'CUSTOMER' ? null : (priority || null),
        status: 'OPEN',
        categoryId,
      }
    })

    // Log the initial status history
    await prisma.statusHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: session.id,
        oldStatus: 'OPEN',
        newStatus: 'OPEN',
      }
    })

    // Handle initial attachments if provided
    if (attachments && Array.isArray(attachments)) {
      for (const att of attachments) {
        await prisma.attachment.create({
          data: {
            ticketId: ticket.id,
            fileUrl: att.fileUrl,
            fileName: att.fileName,
            uploadedBy: session.id,
          }
        })
      }
    }

    // Notify admins of new ticket
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true }
    })
    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          message: `New ticket ${ticketNumber} created by ${session.name}`,
          type: 'NEW_TICKET',
        }
      })
    }

    return NextResponse.json({ id: ticket.id, ticketNumber: ticket.ticketNumber }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
