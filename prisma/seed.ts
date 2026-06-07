import { PrismaClient, Role, Priority, Status } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clear any existing data
  await prisma.notification.deleteMany()
  await prisma.statusHistory.deleteMany()
  await prisma.attachment.deleteMany()
  await prisma.ticketComment.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log('✓ Cleared old data')

  const adminHashedPassword = await bcrypt.hash('password', 10)
  const hashedPassword = await bcrypt.hash('password123', 10)

  // Seed Users
  const admin = await prisma.user.create({
    data: {
      name: 'Andrew Carter',
      email: 'abc@gmail.com',
      passwordHash: adminHashedPassword,
      role: Role.ADMIN,
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
  })

  const customer1 = await prisma.user.create({
    data: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      passwordHash: hashedPassword,
      role: Role.CUSTOMER,
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    },
  })

  const customer2 = await prisma.user.create({
    data: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      passwordHash: hashedPassword,
      role: Role.CUSTOMER,
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  })

  const customer3 = await prisma.user.create({
    data: {
      name: 'Carol Davis',
      email: 'carol@example.com',
      passwordHash: hashedPassword,
      role: Role.CUSTOMER,
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    },
  })

  console.log('✓ Seeded Users (all passwords are: password123)')

  // Seed Categories
  const billing = await prisma.category.create({
    data: { name: 'Billing', description: 'Invoices, payments, refunds and billing issues' }
  })
  const technical = await prisma.category.create({
    data: { name: 'Technical Support', description: 'System crashes, server errors, API issues' }
  })
  const account = await prisma.category.create({
    data: { name: 'Account & Profile', description: 'Logins, passwords, user access controls' }
  })
  const feature = await prisma.category.create({
    data: { name: 'Feature Request', description: 'Requests for new capabilities or improvements' }
  })
  const bug = await prisma.category.create({
    data: { name: 'Bug Report', description: 'Unexpected behavior or bugs in the platform' }
  })

  console.log('✓ Seeded Categories')

  // Seed Tickets
  const ticket1 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-001',
      customerId: customer1.id,
      assignedAgentId: admin.id, // assigned to admin
      subject: 'Login issue with admin panel',
      description: 'Unable to log in to the admin panel since the last deployment. Getting a 403 error.',
      priority: Priority.HIGH,
      status: Status.IN_PROGRESS,
      categoryId: account.id,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  })

  const ticket2 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-002',
      customerId: customer2.id,
      subject: 'Feature request: dark mode',
      description: 'Would love to see a dark mode option for the dashboard. Many users have requested this.',
      priority: Priority.LOW,
      status: Status.OPEN,
      categoryId: feature.id,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  })

  const ticket3 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-003',
      customerId: customer3.id,
      assignedAgentId: admin.id, // assigned to admin
      subject: 'Billing discrepancy on invoice #1042',
      description: 'My invoice shows a different amount than what was agreed upon in the contract.',
      priority: null,
      status: Status.IN_PROGRESS,
      categoryId: billing.id,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 12 * 60 * 60 * 1000),
    }
  })

  const ticket4 = await prisma.ticket.create({
    data: {
      ticketNumber: 'TKT-004',
      customerId: customer1.id,
      assignedAgentId: admin.id, // assigned to admin
      subject: 'Data export not working',
      description: 'The CSV export feature returns an empty file for date ranges with data.',
      priority: Priority.HIGH,
      status: Status.RESOLVED,
      categoryId: bug.id,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      closedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  })

  console.log('✓ Seeded Tickets')

  // Helper to create tickets sequentially
  let ticketCount = 4
  const createTicket = async (
    customerId: string,
    subject: string,
    description: string,
    priority: Priority | null,
    status: Status,
    categoryId: string,
    assignedAgentId: string | null = null,
    createdAt: Date = new Date()
  ) => {
    ticketCount++
    const ticketNumber = `TKT-${String(ticketCount).padStart(3, '0')}`
    const t = await prisma.ticket.create({
      data: {
        ticketNumber,
        customerId,
        assignedAgentId,
        subject,
        description,
        priority,
        status,
        categoryId,
        createdAt,
        updatedAt: createdAt,
      }
    })

    // Add creation status history
    await prisma.statusHistory.create({
      data: {
        ticketId: t.id,
        changedById: customerId,
        oldStatus: Status.OPEN,
        newStatus: Status.OPEN,
        createdAt,
      }
    })

    if (status !== Status.OPEN) {
      // Add update status history
      await prisma.statusHistory.create({
        data: {
          ticketId: t.id,
          changedById: assignedAgentId || customerId,
          oldStatus: Status.OPEN,
          newStatus: status,
          createdAt: new Date(createdAt.getTime() + 2 * 60 * 60 * 1000), // 2 hours later
        }
      })
    }

    return t
  }

  // 1. Seed jamdadeabhishek03@gmail.com user account
  const abhishek = await prisma.user.create({
    data: {
      name: 'Abhishek Jamdade',
      email: 'jamdadeabhishek03@gmail.com',
      passwordHash: hashedPassword,
      role: Role.CUSTOMER,
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    }
  })

  const abhishekTickets = [
    {
      subject: 'Unable to process checkout with Visa card',
      description: 'I tried to pay for my monthly subscription using my Visa card, but I keep getting a processing timeout. Can someone check if there is an issue with the payment gateway?',
      priority: Priority.HIGH,
      status: Status.OPEN,
      category: billing,
    },
    {
      subject: 'Request for custom webhook integration',
      description: 'We need to trigger slack alerts when a ticket status changes. Is it possible to configure custom webhooks on our subscription tier?',
      priority: Priority.MEDIUM,
      status: Status.IN_PROGRESS,
      category: technical,
      agent: admin,
    },
    {
      subject: 'Reset billing cycle to 1st of month',
      description: 'We would like to align our monthly billing invoices with the start of the calendar month instead of the current 12th.',
      priority: Priority.LOW,
      status: Status.RESOLVED,
      category: billing,
      agent: admin,
    },
    {
      subject: 'Dashboard reports returning empty stats',
      description: 'When filtering by custom date ranges on the analytics dashboard, some graphs fail to load and return blank views.',
      priority: null,
      status: Status.IN_PROGRESS,
      category: bug,
      agent: admin,
    }
  ]

  for (let i = 0; i < abhishekTickets.length; i++) {
    const tInfo = abhishekTickets[i]
    const daysAgo = i % 4 // distribute abhishek tickets from 0 to 3 days ago
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

    const t = await createTicket(
      abhishek.id,
      tInfo.subject,
      tInfo.description,
      tInfo.priority,
      tInfo.status,
      tInfo.category.id,
      tInfo.agent?.id || null,
      createdAt
    )

    if (tInfo.status === Status.IN_PROGRESS || tInfo.status === Status.RESOLVED) {
      await prisma.ticketComment.create({
        data: {
          ticketId: t.id,
          authorId: tInfo.agent?.id || admin.id,
          message: `Hello Abhishek, I have updated the status of your request regarding "${tInfo.subject}". Our engineering team is currently looking into it.`,
          isInternal: false,
          createdAt: new Date(createdAt.getTime() + 1 * 60 * 60 * 1000), // 1 hour later
        }
      })
    }
  }

  console.log('✓ Seeded Abhishek Jamdade user and tickets')

  // 2. Seed 30 more users with realistic names and emails
  const mockPeople = [
    { name: 'Liam Davis', email: 'liam.davis@gmail.com' },
    { name: 'Noah Miller', email: 'noah.miller@yahoo.com' },
    { name: 'Oliver Wilson', email: 'oliver.wilson@outlook.com' },
    { name: 'Elijah Moore', email: 'elijah.moore@gmail.com' },
    { name: 'James Taylor', email: 'james.taylor@live.com' },
    { name: 'Benjamin Anderson', email: 'benjamin.a@gmail.com' },
    { name: 'Lucas Thomas', email: 'lucas.thomas@gmail.com' },
    { name: 'Henry Jackson', email: 'henry.j@yahoo.com' },
    { name: 'Alexander White', email: 'alex.white@gmail.com' },
    { name: 'Mason Harris', email: 'mason.harris@gmail.com' },
    { name: 'Michael Martin', email: 'michael.m@outlook.com' },
    { name: 'Ethan Thompson', email: 'ethan.t@gmail.com' },
    { name: 'Daniel Garcia', email: 'daniel.garcia@gmail.com' },
    { name: 'Jacob Martinez', email: 'jacob.m@gmail.com' },
    { name: 'Logan Robinson', email: 'logan.r@yahoo.com' },
    { name: 'Emma Smith', email: 'emma.smith@gmail.com' },
    { name: 'Olivia Johnson', email: 'olivia.j@gmail.com' },
    { name: 'Ava Williams', email: 'ava.w@gmail.com' },
    { name: 'Isabella Brown', email: 'isabella.b@outlook.com' },
    { name: 'Sophia Jones', email: 'sophia.jones@gmail.com' },
    { name: 'Charlotte Miller', email: 'charlotte.m@gmail.com' },
    { name: 'Amelia Davis', email: 'amelia.d@gmail.com' },
    { name: 'Mia Rodriguez', email: 'mia.rod@gmail.com' },
    { name: 'Harper Martinez', email: 'harper.m@gmail.com' },
    { name: 'Evelyn Hernandez', email: 'evelyn.h@gmail.com' },
    { name: 'Abigail Lopez', email: 'abigail.l@yahoo.com' },
    { name: 'Emily Gonzalez', email: 'emily.g@gmail.com' },
    { name: 'Elizabeth Wilson', email: 'elizabeth.w@outlook.com' },
    { name: 'Sofia Anderson', email: 'sofia.a@gmail.com' },
    { name: 'Avery Thomas', email: 'avery.thomas@gmail.com' }
  ]

  const additionalUsers = []
  for (let idx = 0; idx < mockPeople.length; idx++) {
    const person = mockPeople[idx]
    // Distribute user registration dates over the last 15 days (0 to 14 days ago)
    const userDaysAgo = (idx * 3) % 15
    const userCreatedAt = new Date(Date.now() - userDaysAgo * 24 * 60 * 60 * 1000)

    const u = await prisma.user.create({
      data: {
        name: person.name,
        email: person.email,
        passwordHash: hashedPassword,
        role: Role.CUSTOMER,
        createdAt: userCreatedAt,
        updatedAt: userCreatedAt,
      }
    })
    additionalUsers.push(u)
  }

  const allCategories = [billing, technical, account, feature, bug]

  const predefinedSubjects = [
    'Cannot update password via settings page',
    'Exporting data fails with timeout error',
    'API key permissions are not saving',
    'Documentation page has broken formatting',
    'Invoice #4503 billing error',
    'Custom domain SSL configuration stuck',
    'SSO SAML login is throwing 500 error',
    'Please add SMS notification alerts',
    'How to delete old team members?',
    'Unable to view older archived tickets',
    'Billing discount code not applied',
    'Audit logs search filter is slow',
    'Webhook payloads are missing metadata',
    'API limits showing incorrect usage',
    'Stripe auto-pay failing occasionally'
  ]

  const predefinedDescriptions = [
    'When clicking save on the settings page, the new password is not applied and no error is shown.',
    'The CSV export task runs for 30 seconds and then terminates with a network gateway error.',
    'I checked all the read-write boxes for the API key permissions but it keeps reverting to read-only.',
    'The layout of the getting-started page is broken on mobile viewports making it unreadable.',
    'We were billed twice for the same subscription tier on the invoice date. Please process a refund.',
    'We completed the DNS CNAME configuration 48 hours ago but the SSL certificate remains in pending state.',
    'Our enterprise users get a blank page with 500 error code when trying to login via Azure AD.',
    'We need critical alerts sent via SMS instead of just emails. Is this supported?',
    'I am the workspace owner but there is no delete or archive button next to former team members.',
    'The search bar only returns tickets from the last 30 days. We need access to last years records.',
    'The coupon code provided by sales was valid but the final invoice did not reflect the discount.',
    'Filtering audit logs by IP address or specific actions takes more than 15 seconds to return data.',
    'The events payload is missing the user_agent and customer_id fields which are required for audit.',
    'The dashboard says we exceeded our daily API limits, but our logs show we used less than half.',
    'Our payment card was rejected twice, but our bank confirms the transactions were approved.'
  ]

  const customersOnly = additionalUsers.filter(u => u.role === Role.CUSTOMER)

  for (let idx = 0; idx < customersOnly.length; idx++) {
    const customer = customersOnly[idx]
    const numTickets = (idx % 2) + 1
    for (let tIdx = 0; tIdx < numTickets; tIdx++) {
      const subjectIndex = (idx * 2 + tIdx) % predefinedSubjects.length
      const subject = predefinedSubjects[subjectIndex]
      const description = predefinedDescriptions[subjectIndex]
      const priority = [Priority.LOW, Priority.MEDIUM, Priority.HIGH, null][(idx + tIdx) % 4]
      const status = [Status.OPEN, Status.IN_PROGRESS, Status.RESOLVED, Status.CLOSED][(idx * 3 + tIdx) % 4]
      const category = allCategories[(idx + tIdx) % allCategories.length]
      const assignedAgent = status !== Status.OPEN ? admin : null // assign to admin if not open

      // Distribute tickets over the last 7 days (0 to 6 days ago)
      const daysAgo = (idx + tIdx) % 7
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - tIdx * 2 * 60 * 60 * 1000)

      const t = await createTicket(
        customer.id,
        subject,
        description,
        priority,
        status,
        category.id,
        assignedAgent?.id || null,
        createdAt
      )

      if (status !== Status.OPEN && assignedAgent) {
        await prisma.ticketComment.create({
          data: {
            ticketId: t.id,
            authorId: assignedAgent.id,
            message: `Hello ${customer.name}, I am working on this ticket. Will keep you updated here.`,
            isInternal: false,
            createdAt: new Date(createdAt.getTime() + 1 * 60 * 60 * 1000), // 1 hour later
          }
        })
      }
    }
  }

  console.log(`✓ Seeded 30 users and ${ticketCount - 4} tickets`)

  // Seed Comments/Notes
  await prisma.ticketComment.create({
    data: {
      ticketId: ticket1.id,
      authorId: admin.id,
      message: 'I have started looking into this. It seems to be a CORS policy issue.',
      isInternal: true,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.ticketComment.create({
    data: {
      ticketId: ticket1.id,
      authorId: admin.id,
      message: 'Hello Alice, we are investigating the login issue. Can you please share the exact browser version you are using?',
      isInternal: false,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.ticketComment.create({
    data: {
      ticketId: ticket1.id,
      authorId: customer1.id,
      message: 'I am on Chrome Version 120.0.6099.129 on macOS.',
      isInternal: false,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    }
  })

  // Seed Status Histories
  await prisma.statusHistory.create({
    data: {
      ticketId: ticket1.id,
      changedById: admin.id,
      oldStatus: Status.OPEN,
      newStatus: Status.IN_PROGRESS,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  })

  await prisma.statusHistory.create({
    data: {
      ticketId: ticket4.id,
      changedById: admin.id,
      oldStatus: Status.IN_PROGRESS,
      newStatus: Status.RESOLVED,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    }
  })

  // Seed Notifications
  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'A new ticket TKT-001 has been assigned to you.',
      type: 'ASSIGNMENT',
      isRead: true,
    }
  })

  await prisma.notification.create({
    data: {
      userId: admin.id,
      message: 'Alice Johnson replied to TKT-001.',
      type: 'REPLY',
      isRead: false,
    }
  })

  console.log('✓ Seeded Comments, History, and Notifications')
  console.log('🌱 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
