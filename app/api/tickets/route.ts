import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const searchParams = request.nextUrl.searchParams
  const status = searchParams.get('status')
  const priority = searchParams.get('priority')
  const search = searchParams.get('search')

  let query = supabase.from('tickets').select('*').order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)
  if (priority) query = query.eq('priority', priority)
  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,subject.ilike.%${search}%,description.ilike.%${search}%,ticket_id.ilike.%${search}%`
    )
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })

  const body = await request.json()
  const { customer_name, customer_email, subject, description, priority } = body

  if (!customer_name || !customer_email || !subject || !description) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { count } = await supabase.from('tickets').select('*', { count: 'exact', head: true })
  const nextNum = (count ?? 0) + 1
  const ticket_id = `TKT-${String(nextNum).padStart(3, '0')}`

  const { data, error } = await supabase
    .from('tickets')
    .insert([{ ticket_id, customer_name, customer_email, subject, description, priority: priority || 'Medium' }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ticket_id: data.ticket_id, created_at: data.created_at }, { status: 201 })
}
