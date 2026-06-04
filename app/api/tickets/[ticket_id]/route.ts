import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const { ticket_id } = await params

  const { data: ticket, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('ticket_id', ticket_id)
    .single()

  if (error) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })

  const { data: notes } = await supabase
    .from('notes')
    .select('*')
    .eq('ticket_id', ticket_id)
    .order('created_at', { ascending: true })

  return NextResponse.json({ ...ticket, notes: notes || [] })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ ticket_id: string }> }
) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const { ticket_id } = await params
  const body = await request.json()
  const { status, priority, note_text } = body

  const updates: Record<string, string> = { updated_at: new Date().toISOString() }
  if (status) updates.status = status
  if (priority) updates.priority = priority

  const { error } = await supabase.from('tickets').update(updates).eq('ticket_id', ticket_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (note_text) {
    const { error: noteError } = await supabase.from('notes').insert([{ ticket_id, note_text }])
    if (noteError) return NextResponse.json({ error: noteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, updated_at: updates.updated_at })
}
