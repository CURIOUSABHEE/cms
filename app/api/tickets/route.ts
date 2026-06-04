import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/app/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const search = searchParams.get('search')

    let sql = 'SELECT * FROM tickets WHERE 1=1'
    const params: any[] = []
    let idx = 1

    if (status) {
      sql += ` AND status = $${idx++}`
      params.push(status)
    }
    if (priority) {
      sql += ` AND priority = $${idx++}`
      params.push(priority)
    }
    if (search) {
      sql += ` AND (customer_name ILIKE $${idx} OR customer_email ILIKE $${idx} OR subject ILIKE $${idx} OR description ILIKE $${idx} OR ticket_id ILIKE $${idx})`
      params.push(`%${search}%`)
      idx++
    }

    sql += ' ORDER BY created_at DESC'

    const result = await query(sql, params)
    return NextResponse.json(result.rows)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { customer_name, customer_email, subject, description, priority } = body

    if (!customer_name || !customer_email || !subject || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const countResult = await query('SELECT COUNT(*) FROM tickets')
    const nextNum = parseInt(countResult.rows[0].count, 10) + 1
    const ticket_id = `TKT-${String(nextNum).padStart(3, '0')}`

    const result = await query(
      `INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, priority)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ticket_id, created_at`,
      [ticket_id, customer_name, customer_email, subject, description, priority || 'Medium']
    )

    const ticket = result.rows[0]
    return NextResponse.json({ ticket_id: ticket.ticket_id, created_at: ticket.created_at }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
