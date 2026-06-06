import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'
import { getSession } from '@/app/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticket_id } = await params
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket_id)

    const ticket = await prisma.ticket.findFirst({
      where: isUuid ? { OR: [{ id: ticket_id }, { ticketNumber: ticket_id }] } : { ticketNumber: ticket_id },
      include: {
        customer: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        agent: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        category: true,
        comments: {
          include: {
            author: {
              select: { id: true, name: true, role: true, avatarUrl: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        attachments: {
          include: {
            uploader: { select: { name: true } }
          },
          orderBy: { createdAt: 'asc' }
        },
        statusHistory: {
          include: {
            changedBy: { select: { name: true, role: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Role-based authorization
    if (session.role === 'CUSTOMER') {
      if (ticket.customerId !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Hide internal comments from customers
      ticket.comments = ticket.comments.filter(c => !c.isInternal)
    }

    return NextResponse.json(ticket)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ticket_id } = await params
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(ticket_id)

    const ticket = await prisma.ticket.findFirst({
      where: isUuid ? { OR: [{ id: ticket_id }, { ticketNumber: ticket_id }] } : { ticketNumber: ticket_id }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const body = await request.json()
    const { status, priority, categoryId, assignedAgentId, commentMessage, isInternal, attachments } = body

    const isCustomer = session.role === 'CUSTOMER'

    // Customer Permissions Check
    if (isCustomer) {
      if (ticket.customerId !== session.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
      // Customer can only close their own ticket, or update details if unassigned
      if (status && status !== 'CLOSED' && status !== ticket.status) {
        return NextResponse.json({ error: 'Customers can only close their tickets' }, { status: 403 })
      }
      if (priority && priority !== ticket.priority) {
        return NextResponse.json({ error: 'Customers cannot change ticket priority' }, { status: 403 })
      }
      if (assignedAgentId && assignedAgentId !== ticket.assignedAgentId) {
        return NextResponse.json({ error: 'Customers cannot change ticket assignment' }, { status: 403 })
      }
    }

    // Process Update Data
    const updateData: any = {}

    // Track Status History
    if (status && status !== ticket.status) {
      updateData.status = status
      if (status === 'CLOSED') {
        updateData.closedAt = new Date()
      } else {
        updateData.closedAt = null
      }

      await prisma.statusHistory.create({
        data: {
          ticketId: ticket.id,
          changedById: session.id,
          oldStatus: ticket.status,
          newStatus: status,
        }
      })

      // Send status change notification
      if (isCustomer) {
        if (ticket.assignedAgentId) {
          await prisma.notification.create({
            data: {
              userId: ticket.assignedAgentId,
              message: `Customer ${session.name} closed ticket ${ticket.ticketNumber}`,
              type: 'STATUS_CHANGE',
            }
          })
        }
      } else {
        await prisma.notification.create({
          data: {
            userId: ticket.customerId,
            message: `Ticket ${ticket.ticketNumber} status updated to ${status} by ${session.name}`,
            type: 'STATUS_CHANGE',
          }
        })
      }
    }

    // Admin / Agent updates
    if (!isCustomer) {
      if (priority) updateData.priority = priority
      if (categoryId) updateData.categoryId = categoryId
      
      // Handle Assignment Changes
      if (assignedAgentId !== undefined && assignedAgentId !== ticket.assignedAgentId) {
        updateData.assignedAgentId = assignedAgentId === 'unassigned' || !assignedAgentId ? null : assignedAgentId
        
        if (updateData.assignedAgentId) {
          await prisma.notification.create({
            data: {
              userId: updateData.assignedAgentId,
              message: `Ticket ${ticket.ticketNumber} has been assigned to you.`,
              type: 'ASSIGNMENT',
            }
          })
        }

        // Notify customer of assignee update
        await prisma.notification.create({
          data: {
            userId: ticket.customerId,
            message: `Ticket ${ticket.ticketNumber} has been assigned to a staff member.`,
            type: 'ASSIGNMENT',
          }
        })
      }
    }

    // Save ticket updates
    if (Object.keys(updateData).length > 0) {
      await prisma.ticket.update({
        where: { id: ticket.id },
        data: updateData
      })
    }

    // Process Comment Addition
    if (commentMessage && commentMessage.trim()) {
      const comment = await prisma.ticketComment.create({
        data: {
          ticketId: ticket.id,
          authorId: session.id,
          message: commentMessage,
          isInternal: isCustomer ? false : (isInternal || false),
        }
      })

      // Send reply notifications
      if (isCustomer) {
        // Notify assigned agent
        if (ticket.assignedAgentId) {
          await prisma.notification.create({
            data: {
              userId: ticket.assignedAgentId,
              message: `Customer ${session.name} replied to ${ticket.ticketNumber}`,
              type: 'NEW_REPLY',
            }
          })
        } else {
          // Notify all admins if unassigned
          const admins = await prisma.user.findMany({ where: { role: 'ADMIN', isActive: true } })
          for (const admin of admins) {
            await prisma.notification.create({
              data: {
                userId: admin.id,
                message: `New customer reply on unassigned ticket ${ticket.ticketNumber}`,
                type: 'NEW_REPLY',
              }
            })
          }
        }
      } else if (!comment.isInternal) {
        // Notify customer of public reply
        await prisma.notification.create({
          data: {
            userId: ticket.customerId,
            message: `Staff member ${session.name} replied to your ticket ${ticket.ticketNumber}`,
            type: 'NEW_REPLY',
          }
        })
      }
    }

    // Process Attachment Addition
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

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
