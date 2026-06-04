import { NextResponse } from 'next/server'
import { query } from '@/app/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await params

    const ticketResult = await query('SELECT * FROM tickets WHERE ticket_id = $1', [ticket_id])
    if (ticketResult.rows.length === 0) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    const notesResult = await query(
      'SELECT * FROM notes WHERE ticket_id = $1 ORDER BY created_at ASC',
      [ticket_id]
    )

    return NextResponse.json({ ...ticketResult.rows[0], notes: notesResult.rows })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  try {
    const { ticket_id } = await params
    const body = await request.json()
    const { status, priority, note_text } = body

    const updates: string[] = []
    const values: any[] = []
    let idx = 1

    if (status) {
      updates.push(`status = $${idx++}`)
      values.push(status)
    }
    if (priority) {
      updates.push(`priority = $${idx++}`)
      values.push(priority)
    }
    const updated_at = new Date().toISOString()
    updates.push(`updated_at = $${idx++}`)
    values.push(updated_at)

    if (updates.length > 1) {
      values.push(ticket_id)
      await query(
        `UPDATE tickets SET ${updates.join(', ')} WHERE ticket_id = $${idx}`,
        values
      )
    }

    if (note_text) {
      await query(
        'INSERT INTO notes (ticket_id, note_text) VALUES ($1, $2)',
        [ticket_id, note_text]
      )
    }

    return NextResponse.json({ success: true, updated_at })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
