'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { useAuth } from '../context/AuthContext'

const TicketChart = dynamic(() => import('../components/TicketChart'), { ssr: false })
const GaugeChart = dynamic(() => import('../components/GaugeChart'), { ssr: false })

type Ticket = {
  ticket_id: string
  ticket_number?: string
  customer_name: string
  customer_email: string
  subject: string
  status: string
  priority: string
  created_at: string
  category?: { name: string }
}
type Analytics = {
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  ticketsPerDay: { date: string; created: number; resolved: number }[]
  trends?: {
    total: number
    closed: number
    inProgress: number
    open: number
  }
}

/* ── Skeleton helpers ───────────────────────────────────── */
function Sk({ w, h, r = 6 }: { w: number | string; h: number; r?: number }) {
  return <div className="skeleton" style={{ width: w, height: h, borderRadius: r }} />
}

/* ── Arrow link icon ────────────────────────────────────── */
function ArrowIcon({ color = 'var(--text-muted)' }: { color?: string }) {
  return (
    <div
      style={{
        width: 28, height: 28, borderRadius: '50%',
        border: '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color, flexShrink: 0,
      }}
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
      </svg>
    </div>
  )
}

/* ── Stat card (light) ──────────────────────────────────── */
function StatCard({ label, value, sub, trend, href }: { label: string; value: number; sub?: string; trend?: number; href?: string }) {
  const isPositive = trend !== undefined && trend >= 0
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
          {href && (
            <Link href={href} style={{ textDecoration: 'none' }}>
              <ArrowIcon />
            </Link>
          )}
        </div>
        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: isPositive ? 'var(--green-50)' : 'var(--prio-urgent-bg)',
            borderRadius: '999px',
            padding: '2px 8px',
            border: `1px solid ${isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)'}`
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={isPositive ? 'var(--green-600)' : 'var(--prio-urgent)'} strokeWidth={2.5}>
              {isPositive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17h10M7 17V7" />
              )}
            </svg>
            <span style={{ fontSize: '0.65rem', color: isPositive ? 'var(--green-700)' : 'var(--prio-urgent)', fontWeight: 700 }}>
              {isPositive ? '+' : ''}{trend}%
            </span>
          </div>
        )}
        {sub && (
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Stat card (dark — Total Tickets) ───────────────────── */
function StatCardDark({ value, label = "Total Tickets", sub, trend }: { value: number; label?: string; sub?: string; trend?: number }) {
  const isPositive = trend !== undefined && trend >= 0
  return (
    <div className="card-dark" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>{label}</p>
          <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </div>
        </div>
        <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {trend !== undefined && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            background: isPositive ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
            borderRadius: '999px',
            padding: '2px 8px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              {isPositive ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17h10M7 17V7" />
              )}
            </svg>
            <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700 }}>
              {isPositive ? '+' : ''}{trend}%
            </span>
          </div>
        )}
        {sub && (
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            {sub}
          </span>
        )}
      </div>
    </div>
  )
}

/* ── Recent activity (SLA alerts) ───────────────────────── */
function RecentActivity({ tickets }: { tickets: Ticket[] }) {
  const urgent = tickets.filter(t => t.priority === 'HIGH' || t.status === 'OPEN').slice(0, 1)
  const ticket = urgent[0]
  return (
    <div className="card" style={{ padding: '1.25rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
        Reminders
      </h3>
      {ticket ? (
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem', lineHeight: 1.3 }}>
            {ticket.subject.length > 35 ? ticket.subject.slice(0, 35) + '…' : ticket.subject}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            From: {ticket.customer_name}
          </p>
          <Link
            href={`/tickets/${ticket.ticket_id}`}
            className="btn-primary"
            style={{ textDecoration: 'none', justifyContent: 'center', fontSize: '0.8rem', width: '100%' }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Ticket
          </Link>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: '0.8rem' }}>
          No urgent tickets 🎉
        </div>
      )}
    </div>
  )
}

/* ── Ticket queue (right panel) ─────────────────────────── */
const QUEUE_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
function TicketQueue({ tickets }: { tickets: Ticket[] }) {
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Ticket Queue</h3>
        <Link href="/tickets/new" className="btn-green-outline" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
          + New
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tickets.slice(0, 5).map((t, i) => {
          const isNew = !t.priority
          return (
            <Link
              key={t.ticket_id}
              href={`/tickets/${t.ticket_id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
                padding: isNew ? '0.375rem 0.5rem' : '0',
                borderRadius: isNew ? 'var(--radius-md)' : '0',
                borderLeft: isNew ? '3px solid var(--green-600)' : '3px solid transparent',
                background: isNew ? 'var(--green-50)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
                  background: QUEUE_COLORS[i % QUEUE_COLORS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                    {t.subject}
                  </p>
                  {isNew && (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--green-900)',
                      color: '#fff',
                      padding: '1px 4px',
                      borderRadius: '3px',
                    }}>
                      NEW
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  Created: {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </Link>
          )
        })}
        {tickets.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center', padding: '1rem 0' }}>
            No tickets yet
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Team collaboration (recent tickets table) ───────────── */
function TeamCollaboration({ tickets }: { tickets: Ticket[] }) {
  const AVATARS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  return (
    <div className="card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>Team Collaboration</h3>
        <Link href="/tickets/new" className="btn-ghost" style={{ fontSize: '0.75rem', border: '1.5px solid var(--border)', borderRadius: '999px', padding: '0.3rem 0.875rem' }}>
          + Add Ticket
        </Link>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {tickets.slice(0, 5).map((t, i) => {
          const isNew = !t.priority
          return (
            <div
              key={t.ticket_id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: isNew ? '0.375rem 0.5rem' : '0',
                borderRadius: isNew ? 'var(--radius-md)' : '0',
                borderLeft: isNew ? '3px solid var(--green-600)' : '3px solid transparent',
                background: isNew ? 'var(--green-50)' : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              <div
                style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  background: AVATARS[i % AVATARS.length],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                }}
              >
                {t.customer_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                    {t.customer_name}
                  </p>
                  {isNew && (
                    <span style={{
                      fontSize: '0.6rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--green-900)',
                      color: '#fff',
                      padding: '1px 4px',
                      borderRadius: '3px',
                    }}>
                      NEW
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: '2px 0 0' }}>
                  Working on <span style={{ fontWeight: 700 }}>{t.subject}</span>
                </p>
              </div>
              <StatusBadge status={t.status} />
            </div>
          )
        })}
        {tickets.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center', padding: '1rem 0' }}>
            No tickets
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Customer Portal View ────────────────────────────────── */
function CustomerDashboardView({ tickets, loading, user }: { tickets: Ticket[]; loading: boolean; user: { name: string; role: string } | null }) {
  const activeCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length
  const resolvedCount = tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length
  
  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            Welcome back{user ? `, ${user.name}` : ''} 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Need assistance? Submit a ticket and our team will get in touch with you.
          </p>
        </div>
        <div>
          <Link href="/tickets/new" className="btn-primary" style={{ textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Create New Ticket
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
        <div className="animate-fade-up stagger-1">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} />
            </div>
          ) : <StatCardDark value={tickets.length} label="My Tickets" sub="All registered tickets" />}
        </div>

        <div className="animate-fade-up stagger-2">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} />
            </div>
          ) : <StatCard label="Active Tickets" value={activeCount} sub="In Progress or Open" />}
        </div>

        <div className="animate-fade-up stagger-3">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} />
            </div>
          ) : <StatCard label="Resolved Tickets" value={resolvedCount} sub="Completed support requests" />}
        </div>
      </div>

      {/* Tickets List */}
      <div className="card animate-fade-up stagger-2" style={{ padding: '1.5rem', overflow: 'hidden' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
          My Support Requests
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
                {['Ticket ID', 'Subject', 'Category', 'Status', 'Priority', 'Last Updated'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    {[80, 200, 100, 70, 70, 90].map((w, j) => (
                      <td key={j} style={{ padding: '1rem 1.25rem' }}>
                        <Sk w={w} h={13} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--green-50)', border: '1px solid var(--green-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
                        🎫
                      </div>
                      <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>You don&apos;t have any support tickets yet.</p>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>If you need help with an order, billing, or technical issues, create a support ticket.</p>
                      <Link href="/tickets/new" className="btn-primary" style={{ textDecoration: 'none' }}>Submit a Ticket</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map(t => (
                  <tr key={t.ticket_id} className="table-row">
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <Link href={`/tickets/${t.ticket_id}`} className="ticket-id" style={{ textDecoration: 'none' }}>
                        {t.ticket_number || `TKT-${t.ticket_id.slice(0, 5)}`}
                      </Link>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <Link href={`/tickets/${t.ticket_id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {t.subject}
                      </Link>
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {t.category?.name || 'General'}
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

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return
    try {
      if (user.role === 'CUSTOMER') {
        const res = await fetch('/api/tickets')
        if (res.ok) {
          const t = await res.json()
          setTickets(Array.isArray(t) ? t : [])
        }
      } else {
        const [aRes, tRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/tickets')
        ])
        if (aRes.ok) {
          const a = await aRes.json()
          setAnalytics(a)
        }
        if (tRes.ok) {
          const t = await tRes.json()
          setTickets(Array.isArray(t) ? t : [])
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData()
    }
  }, [user, fetchData])

  if (user?.role === 'CUSTOMER') {
    return <CustomerDashboardView tickets={tickets} loading={loading} user={user} />
  }

  const total      = analytics?.total ?? 0
  const open       = analytics?.byStatus?.Open ?? 0
  const inProgress = analytics?.byStatus?.['InProgress'] || analytics?.byStatus?.['IN_PROGRESS'] || 0
  const closed     = analytics?.byStatus?.Closed ?? 0
  const resRate    = total > 0 ? Math.round((closed / total) * 100) : 0

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* ── Page header ── */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            Welcome{user ? `, ${user.name}` : ''} 👋
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Plan, prioritize, and resolve your support tickets with ease.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
          <Link href="/tickets/new" className="btn-primary" style={{ textDecoration: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Ticket
          </Link>
          <Link href="/tickets" className="btn-secondary" style={{ textDecoration: 'none' }}>
            View All
          </Link>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_260px] gap-4">

        {/* ── Row 1: Stats ─────────────────────────────────── */}
        <div className="animate-fade-up stagger-1">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : <StatCardDark value={total} label="Total Tickets" sub="vs last week" trend={analytics?.trends?.total} />}
        </div>

        <div className="animate-fade-up stagger-2">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : <StatCard label="Closed Tickets" value={closed} sub="vs last week" trend={analytics?.trends?.closed} href="/tickets?status=Closed" />}
        </div>

        <div className="animate-fade-up stagger-3">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : <StatCard label="In Progress" value={inProgress} sub="vs last week" trend={analytics?.trends?.inProgress} href="/tickets?status=In Progress" />}
        </div>

        <div className="animate-fade-up stagger-4">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : (
            <StatCard label="Open Tickets" value={open} sub="vs last week" trend={analytics?.trends?.open} href="/tickets?status=Open" />
          )}
        </div>

        {/* ── Row 2: Analytics chart (col 1-3) | Reminders (col 4) ── */}
        <div className="card animate-fade-up stagger-2 md:col-span-2 xl:col-span-3" style={{ padding: '1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Ticket Analytics
            </h3>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.78rem', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--green-900)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Created</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--green-300)' }} />
                <span style={{ color: 'var(--text-muted)' }}>Resolved</span>
              </div>
            </div>
          </div>
          {loading || !analytics
            ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            : <TicketChart data={analytics.ticketsPerDay} />
          }
        </div>

        <div className="animate-fade-up stagger-3 md:col-span-1 xl:col-span-1">
          {loading
            ? <div className="card" style={{ height: '100%' }}><div className="skeleton" style={{ height: '100%', borderRadius: 16 }} /></div>
            : <RecentActivity tickets={tickets} />
          }
        </div>

        {/* ── Row 3: Gauge (col 1) | Team collab (col 2-3) | Queue (col 4) ── */}
        <div className="card animate-fade-up stagger-4 md:col-span-1 xl:col-span-1" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Resolution Progress
          </h3>
          {loading || !analytics
            ? <div className="skeleton" style={{ height: 180, borderRadius: 8, marginTop: '0.5rem' }} />
            : <GaugeChart value={resRate} closed={closed} total={total} inProgress={inProgress} />
          }
        </div>

        <div className="card animate-fade-up stagger-3 md:col-span-2 xl:col-span-2" style={{ padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3,4].map(i => <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Sk w={32} h={32} r={16} /><div style={{ flex: 1 }}><Sk w="60%" h={12} /><div style={{ marginTop: '4px' }}><Sk w="80%" h={10} /></div></div></div>)}
            </div>
          ) : <TeamCollaboration tickets={tickets} />}
        </div>

        <div className="animate-fade-up stagger-3 md:col-span-2 xl:col-span-1">
          {loading
            ? <div className="card" style={{ height: '100%' }}><div className="skeleton" style={{ height: '100%', borderRadius: 16 }} /></div>
            : <TicketQueue tickets={tickets} />
          }
        </div>

      </div>
    </div>
  )
}
