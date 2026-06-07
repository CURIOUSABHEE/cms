import { Pool } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const CUSTOMERS = [
  { name: 'Alice Johnson', email: 'alice@example.com', subject: 'Login issue with admin panel', description: 'Unable to log in to the admin panel since the last deployment. Getting a 403 error.', priority: 'High', status: 'Open' },
  { name: 'Bob Smith', email: 'bob@example.com', subject: 'Feature request: dark mode', description: 'Would love to see a dark mode option for the dashboard. Many users have requested this.', priority: 'Low', status: 'Open' },
  { name: 'Carol Davis', email: 'carol@example.com', subject: 'Billing discrepancy on invoice #1042', description: 'My invoice shows a different amount than what was agreed upon in the contract.', priority: null, status: 'In Progress' },
  { name: 'Dan Wilson', email: 'dan@example.com', subject: 'API rate limiting too strict', description: 'Our integration is hitting rate limits frequently. Can we increase the limit for enterprise plans?', priority: 'Medium', status: 'In Progress' },
  { name: 'Eve Martin', email: 'eve@example.com', subject: 'Data export not working', description: 'The CSV export feature returns an empty file for date ranges with data.', priority: 'High', status: 'Closed' },
  { name: 'Frank Lee', email: 'frank@example.com', title: 'Frank Lee', subject: 'Password reset email not received', description: 'Requested password reset multiple times but no email arrives. Checked spam folder.', priority: 'High', status: 'Open' },
  { name: 'Grace Kim', email: 'grace@example.com', subject: 'Integration with Slack broken', description: 'The Slack integration stopped sending notifications after the latest update.', priority: 'High', status: 'Closed' },
  { name: 'Henry Brown', email: 'henry@example.com', subject: 'Dashboard loading slowly', description: 'The main dashboard takes over 10 seconds to load. This started happening this week.', priority: 'Medium', status: 'Open' },
  { name: 'Ivy Chen', email: 'ivy@example.com', subject: 'User permissions not saving', description: 'When I try to update user roles in the admin panel, the changes are not persisted.', priority: 'High', status: 'Closed' },
  { name: 'Jack Taylor', email: 'jack@example.com', subject: 'Mobile app crashes on startup', description: 'The mobile app crashes immediately on launch after the latest update. Using iOS 18.', priority: 'High', status: 'In Progress' },
]

try {
  // Clear existing data for fresh seed
  await pool.query('TRUNCATE tickets, notes, users RESTART IDENTITY CASCADE')
  console.log('✓ cleared existing data')

  // Seed demo user
  const hashed = await bcrypt.hash('password123', 10)
  await pool.query(
    `INSERT INTO users (name, email, password) VALUES ($1, $2, $3)`,
    ['Demo User', 'demo@example.com', hashed]
  )
  console.log('✓ demo user created (demo@example.com / password123)')

  // Seed tickets
  for (const c of CUSTOMERS) {
    const countResult = await pool.query('SELECT COUNT(*) FROM tickets')
    const nextNum = parseInt(countResult.rows[0].count, 10) + 1
    const ticketId = `TKT-${String(nextNum).padStart(3, '0')}`

    const daysAgo = Math.floor(Math.random() * 14)
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 3 * 24 * 60 * 60 * 1000)

    await pool.query(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [ticketId, c.name, c.email, c.subject, c.description, c.status, c.priority, createdAt, updatedAt]
    )

    // Add notes for some tickets
    if (c.status !== 'Open') {
      const noteDaysAgo = Math.floor(Math.random() * 5)
      const noteDate = new Date(Date.now() - noteDaysAgo * 24 * 60 * 60 * 1000)
      await pool.query(
        `INSERT INTO notes (ticket_id, note_text, created_at) VALUES ($1, $2, $3)`,
        [ticketId, `We are looking into this issue and will follow up shortly.`, noteDate]
      )
    }

    console.log(`  ✓ ${ticketId} — ${c.subject}`)
  }

  await pool.end()
  console.log('\nSeed complete!')
} catch (err) {
  console.error('Seed failed:', err)
  process.exit(1)
}
