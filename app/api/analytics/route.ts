import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const { data: tickets, error } = await supabase.from('tickets').select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total = tickets.length
  const byStatus: Record<string, number> = { Open: 0, 'In Progress': 0, Closed: 0 }
  const byPriority: Record<string, number> = { Low: 0, Medium: 0, High: 0, Urgent: 0 }

  const last7Days: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    last7Days[d.toISOString().split('T')[0]] = 0
  }

  for (const t of tickets) {
    if (byStatus[t.status] !== undefined) byStatus[t.status]++
    if (byPriority[t.priority] !== undefined) byPriority[t.priority]++
    const day = t.created_at?.split('T')[0]
    if (day && last7Days[day] !== undefined) last7Days[day]++
  }

  return NextResponse.json({
    total,
    byStatus,
    byPriority,
    ticketsPerDay: Object.entries(last7Days).map(([date, count]) => ({ date, count })),
  })
}
