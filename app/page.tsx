'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import StatusBadge from './components/StatusBadge'
import PriorityBadge from './components/PriorityBadge'

const TicketChart = dynamic(() => import('./components/TicketChart'), { ssr: false })
const GaugeChart = dynamic(() => import('./components/GaugeChart'), { ssr: false })

type Ticket = {
  ticket_id: string
  customer_name: string
  customer_email: string
  subject: string
  status: string
  priority: string
  created_at: string
}
type Analytics = {
  total: number
  byStatus: Record<string, number>
  byPriority: Record<string, number>
  ticketsPerDay: { date: string; count: number }[]
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
function StatCard({ label, value, sub, href }: { label: string; value: number; sub: string; href?: string }) {
  return (
    <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</p>
        <Link href={href ?? '#'} style={{ textDecoration: 'none' }}>
          <ArrowIcon />
        </Link>
      </div>
      <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--green-50)', borderRadius: '999px', padding: '2px 6px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
          <span style={{ fontSize: '0.65rem', color: 'var(--green-700)', fontWeight: 600 }}>{sub}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Stat card (dark — Total Tickets) ───────────────────── */
function StatCardDark({ value }: { value: number }) {
  return (
    <div className="card-dark" style={{ padding: '1.25rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'rgba(255,255,255,0.65)' }}>Total Tickets</p>
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>
      </div>
      <p style={{ fontSize: '2.25rem', fontWeight: 800, color: '#fff', lineHeight: 1, marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(255,255,255,0.12)', borderRadius: '999px', padding: '2px 8px' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Increased from last month</span>
        </div>
      </div>
    </div>
  )
}

/* ── Recent activity (SLA alerts) ───────────────────────── */
function RecentActivity({ tickets }: { tickets: Ticket[] }) {
  const urgent = tickets.filter(t => t.priority === 'Urgent' || t.status === 'Open').slice(0, 1)
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
        {tickets.slice(0, 5).map((t, i) => (
          <Link
            key={t.ticket_id}
            href={`/tickets/${t.ticket_id}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}
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
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.subject}
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                Due: {new Date(t.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </Link>
        ))}
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
        {tickets.slice(0, 5).map((t, i) => (
          <div key={t.ticket_id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
              <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t.customer_name}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Working on <span style={{ fontStyle: 'italic' }}>{t.subject}</span>
              </p>
            </div>
            <StatusBadge status={t.status} />
          </div>
        ))}
        {tickets.length === 0 && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', textAlign: 'center', padding: '1rem 0' }}>
            No tickets
          </p>
        )}
      </div>
    </div>
  )
}

/* ── Response timer card ────────────────────────────────── */
function ResponseTimer() {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(true)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [running])

  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const fmt = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="card-dark" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)' }} />
      <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
      <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)', marginBottom: '0.75rem' }}>
        Response Timer
      </p>
      <p
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1.75rem',
          fontWeight: 600,
          color: '#fff',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          lineHeight: 1,
        }}
      >
        {fmt(h)}:{fmt(m)}:{fmt(s)}
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={() => setRunning(r => !r)}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s', color: 'white',
          }}
          aria-label={running ? 'Pause' : 'Resume'}
        >
          {running ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M5 3l14 9-14 9V3z" /></svg>
          )}
        </button>
        <button
          onClick={() => { setSeconds(0); setRunning(false) }}
          style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#EF4444', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'background 0.15s',
          }}
          aria-label="Stop"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><rect x="4" y="4" width="16" height="16" rx="2" /></svg>
        </button>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [a, t] = await Promise.all([
        fetch('/api/analytics').then(r => r.json()),
        fetch('/api/tickets').then(r => r.json()),
      ])
      setAnalytics(a)
      setTickets(Array.isArray(t) ? t : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const total      = analytics?.total ?? 0
  const open       = analytics?.byStatus.Open ?? 0
  const inProgress = analytics?.byStatus['In Progress'] ?? 0
  const closed     = analytics?.byStatus.Closed ?? 0
  const resRate    = total > 0 ? Math.round((closed / total) * 100) : 0

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1400px' }}>
      {/* ── Page header ── */}
      <div className="animate-fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.25rem' }}>
            Dashboard
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 260px', gridTemplateRows: 'auto auto auto auto', gap: '1rem' }}>

        {/* ── Row 1: Stats ─────────────────────────────────── */}
        <div className="animate-fade-up stagger-1">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : <StatCardDark value={total} />}
        </div>

        <div className="animate-fade-up stagger-2">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : <StatCard label="Closed Tickets" value={closed} sub="Increased from last month" href="/tickets?status=Closed" />}
        </div>

        <div className="animate-fade-up stagger-3">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : <StatCard label="In Progress" value={inProgress} sub="Increased from last month" href="/tickets?status=In Progress" />}
        </div>

        <div className="animate-fade-up stagger-4">
          {loading ? (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}><Sk w={80} h={12} /> <Sk w={28} h={28} r={14} /></div>
              <Sk w={48} h={36} r={6} /> <div style={{ marginTop: '0.5rem' }}><Sk w={140} h={16} r={8} /></div>
            </div>
          ) : (
            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Open Tickets</p>
                <Link href="/tickets?status=Open" style={{ textDecoration: 'none' }}><ArrowIcon /></Link>
              </div>
              <p style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, marginBottom: '0.5rem', fontVariantNumeric: 'tabular-nums' }}>{open}</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting response</p>
            </div>
          )}
        </div>

        {/* ── Row 2: Analytics chart (col 1-3) | Reminders (col 4) ── */}
        <div className="card animate-fade-up stagger-2" style={{ gridColumn: '1 / 4', padding: '1.25rem 1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            Ticket Analytics
          </h3>
          {loading
            ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            : <TicketChart data={analytics!.ticketsPerDay} />
          }
        </div>

        <div className="animate-fade-up stagger-3" style={{ gridColumn: '4 / 5' }}>
          {loading
            ? <div className="card" style={{ height: '100%' }}><div className="skeleton" style={{ height: '100%', borderRadius: 16 }} /></div>
            : <RecentActivity tickets={tickets} />
          }
        </div>

        {/* ── Row 3: Team collab (col 1-2) | Gauge (col 3) | Queue (col 4, rows 3-4) ── */}
        <div className="card animate-fade-up stagger-3" style={{ gridColumn: '1 / 3', padding: '1.25rem' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1,2,3,4].map(i => <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}><Sk w={32} h={32} r={16} /><div style={{ flex: 1 }}><Sk w="60%" h={12} /><div style={{ marginTop: '4px' }}><Sk w="80%" h={10} /></div></div></div>)}
            </div>
          ) : <TeamCollaboration tickets={tickets} />}
        </div>

        <div className="card animate-fade-up stagger-4" style={{ gridColumn: '3 / 4', padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Resolution Progress
          </h3>
          {loading
            ? <div className="skeleton" style={{ height: 180, borderRadius: 8, marginTop: '0.5rem' }} />
            : <GaugeChart value={resRate} closed={closed} total={total} inProgress={inProgress} />
          }
        </div>

        <div className="animate-fade-up stagger-3" style={{ gridColumn: '4 / 5', gridRow: '3 / 4' }}>
          {loading
            ? <div className="card" style={{ height: '100%' }}><div className="skeleton" style={{ height: '100%', borderRadius: 16 }} /></div>
            : <TicketQueue tickets={tickets} />
          }
        </div>

        {/* ── Row 4: Timer (col 4) ── */}
        <div className="animate-fade-up stagger-4" style={{ gridColumn: '4 / 5', gridRow: '4 / 5' }}>
          <ResponseTimer />
        </div>

      </div>
    </div>
  )
}
