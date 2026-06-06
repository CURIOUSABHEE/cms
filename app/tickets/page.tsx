'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

type Ticket = {
  ticket_id: string
  customer_name: string
  customer_email: string
  subject: string
  description: string
  status: string
  priority: string
  created_at: string
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
      {[90, 130, 210, 80, 70, 80].map((w, i) => (
        <td key={i} style={{ padding: '1rem 1.25rem' }}>
          <div className="skeleton" style={{ width: w, height: 13, borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  )
}

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchTickets = useCallback(async (q = search, st = statusFilter, pr = priorityFilter) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      if (st) params.set('status', st)
      if (pr) params.set('priority', pr)
      const res = await fetch(`/api/tickets?${params}`)
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchTickets(search, statusFilter, priorityFilter)
    }, 280)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, statusFilter, priorityFilter]) // eslint-disable-line

  useEffect(() => {
    const iv = setInterval(() => fetchTickets(), 30000)
    return () => clearInterval(iv)
  }, [fetchTickets])

  function exportCSV() {
    const headers = ['Ticket ID', 'Customer Name', 'Customer Email', 'Subject', 'Description', 'Status', 'Priority', 'Created At']
    const rows = tickets.map(t => [t.ticket_id, t.customer_name, t.customer_email, t.subject, t.description, t.status, t.priority, t.created_at])
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const hasFilters = !!(search || statusFilter || priorityFilter)

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1400px' }}>
      {/* Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            All Tickets
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {loading ? 'Loading tickets…' : `${tickets.length} ticket${tickets.length !== 1 ? 's' : ''} found`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <button onClick={exportCSV} className="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <Link href="/tickets/new" className="btn-primary" style={{ textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div
        className="card animate-fade-up stagger-1"
        style={{ padding: '0.875rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}
      >
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, ID, subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.25rem', borderRadius: 'var(--radius-full)' }}
          />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select" style={{ minWidth: '140px', borderRadius: 'var(--radius-full)' }}>
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>

        <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="select" style={{ minWidth: '150px', borderRadius: 'var(--radius-full)' }}>
          <option value="">All Priority</option>
          <option value="Urgent">Urgent</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {hasFilters && (
          <button className="btn-ghost" onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter('') }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card animate-fade-up stagger-2" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
                {['Ticket ID', 'Customer', 'Subject', 'Status', 'Priority', 'Created'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                        🎫
                      </div>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {hasFilters ? 'No tickets match your filters' : 'No tickets yet'}
                      </p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        {hasFilters ? 'Try adjusting your filters' : 'Create your first support ticket to get started'}
                      </p>
                      {hasFilters
                        ? <button className="btn-secondary" onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter('') }}>Clear filters</button>
                        : <Link href="/tickets/new" className="btn-primary" style={{ textDecoration: 'none' }}>Create Ticket</Link>
                      }
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map(t => (
                  <tr key={t.ticket_id} className="table-row">
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <Link href={`/tickets/${t.ticket_id}`} className="ticket-id" style={{ textDecoration: 'none' }}>
                        {t.ticket_id}
                      </Link>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1px' }}>{t.customer_name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.customer_email}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)', maxWidth: '260px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.subject}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><StatusBadge status={t.status} /></td>
                    <td style={{ padding: '0.875rem 1.25rem' }}><PriorityBadge priority={t.priority} /></td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                      {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
