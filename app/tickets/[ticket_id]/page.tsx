'use client'

import { useState, useEffect } from 'react'
import { use } from 'react'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import NotesSection from '../../components/NotesSection'
import toast from 'react-hot-toast'
import Link from 'next/link'

type Ticket = {
  ticket_id: string
  customer_name: string
  customer_email: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  notes: { id: string; note_text: string; created_at: string }[]
}

const PRIORITIES = [
  { value: 'Low',    color: 'var(--prio-low)',    bg: 'var(--prio-low-bg)',    border: '#BBF7D0' },
  { value: 'Medium', color: 'var(--prio-medium)', bg: 'var(--prio-medium-bg)', border: '#FEF08A' },
  { value: 'High',   color: 'var(--prio-high)',   bg: 'var(--prio-high-bg)',   border: '#FED7AA' },
  { value: 'Urgent', color: 'var(--prio-urgent)', bg: 'var(--prio-urgent-bg)', border: '#FECACA' },
]

function SkeletonDetail() {
  return (
    <div style={{ padding: '1.75rem 2rem' }}>
      <div className="skeleton" style={{ width: 200, height: 14, borderRadius: 4, marginBottom: '1.5rem' }} />
      <div className="card" style={{ padding: '2rem' }}>
        <div className="skeleton" style={{ width: 300, height: 22, borderRadius: 4, marginBottom: '0.75rem' }} />
        <div className="skeleton" style={{ width: 180, height: 14, borderRadius: 4, marginBottom: '1.5rem' }} />
        <div className="skeleton" style={{ height: 80, borderRadius: 8, marginBottom: '1.5rem' }} />
      </div>
    </div>
  )
}

export default function TicketDetailPage({ params }: { params: Promise<{ ticket_id: string }> }) {
  const { ticket_id } = use(params)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  async function fetchTicket() {
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`)
      if (res.status === 404) { setNotFound(true); return }
      if (!res.ok) { toast.error('Failed to load ticket'); return }
      const data = await res.json()
      setTicket(data)
      setStatus(data.status)
      setPriority(data.priority)
      setIsDirty(false)
    } catch { toast.error('Network error') }
  }

  useEffect(() => { fetchTicket() }, [ticket_id]) // eslint-disable-line

  useEffect(() => {
    if (ticket) setIsDirty(status !== ticket.status || priority !== ticket.priority)
  }, [status, priority, ticket])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, priority }),
      })
      if (res.ok) { toast.success('Ticket updated'); fetchTicket() }
      else toast.error('Failed to update')
    } catch { toast.error('Network error') }
    setSaving(false)
  }

  async function copyId() {
    await navigator.clipboard.writeText(ticket_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  if (notFound) {
    return (
      <div style={{ padding: '1.75rem 2rem' }}>
        <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--prio-urgent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚠️</div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Ticket not found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{ticket_id} does not exist</p>
          <Link href="/tickets" className="btn-primary" style={{ textDecoration: 'none' }}>← Back to Tickets</Link>
        </div>
      </div>
    )
  }

  if (!ticket) return <SkeletonDetail />

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '900px' }}>
      {/* Breadcrumb */}
      <nav className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <Link href="/tickets" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Tickets</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span className="ticket-id">{ticket.ticket_id}</span>
      </nav>

      {/* Main card */}
      <div className="card animate-fade-up" style={{ marginBottom: '1rem', overflow: 'hidden' }}>
        {/* Green accent bar at top */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--green-700), var(--green-400), transparent)' }} />

        <div style={{ padding: '1.75rem 2rem' }}>
          {/* Title + badges */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
                {ticket.subject}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                <button
                  onClick={copyId}
                  className="ticket-id"
                  style={{
                    background: 'var(--green-50)', border: '1.5px solid var(--green-200)',
                    borderRadius: '6px', padding: '0.2rem 0.625rem',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', transition: 'background 0.15s',
                    fontFamily: 'var(--font-mono)',
                  }}
                  title="Click to copy"
                >
                  {ticket.ticket_id}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    {copied
                      ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      : <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    }
                  </svg>
                </button>
                <StatusBadge status={ticket.status} />
                <PriorityBadge priority={ticket.priority} />
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border-light)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--green-500), var(--green-900))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
              {ticket.customer_name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{ticket.customer_name}</p>
              <a href={`mailto:${ticket.customer_email}`} style={{ fontSize: '0.78rem', color: 'var(--green-600)', textDecoration: 'none' }}>
                {ticket.customer_email}
              </a>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                Created: {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                Updated: {new Date(ticket.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.625rem' }}>Description</p>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{ticket.description}</p>
            </div>
          </div>

          {/* Update controls */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1.25rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} className="select" style={{ minWidth: '160px' }}>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Priority</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPriority(p.value)}
                      style={{
                        padding: '0.375rem 0.875rem', borderRadius: 'var(--radius-full)',
                        fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                        border: priority === p.value ? `1.5px solid ${p.color}` : '1.5px solid var(--border)',
                        background: priority === p.value ? p.bg : 'transparent',
                        color: priority === p.value ? p.color : 'var(--text-muted)',
                        fontFamily: 'var(--font)',
                      }}
                    >
                      {p.value}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="btn-primary"
              style={{ borderRadius: 'var(--radius-full)', opacity: !isDirty && !saving ? 0.5 : 1 }}
            >
              {saving ? 'Saving…' : isDirty ? 'Save Changes' : '✓ Saved'}
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="card animate-fade-up stagger-2" style={{ padding: '1.75rem 2rem' }}>
        <NotesSection ticketId={ticket_id} notes={ticket.notes} />
      </div>
    </div>
  )
}
