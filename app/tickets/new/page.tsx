'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

type FormData = {
  customer_name: string
  customer_email: string
  subject: string
  description: string
  priority: string
}

const PRIORITIES = [
  { value: 'Low',    color: 'var(--prio-low)',    bg: 'var(--prio-low-bg)',    border: '#BBF7D0' },
  { value: 'Medium', color: 'var(--prio-medium)', bg: 'var(--prio-medium-bg)', border: '#FEF08A' },
  { value: 'High',   color: 'var(--prio-high)',   bg: 'var(--prio-high-bg)',   border: '#FED7AA' },
  { value: 'Urgent', color: 'var(--prio-urgent)', bg: 'var(--prio-urgent-bg)', border: '#FECACA' },
]

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
          {label}{required && <span style={{ color: 'var(--prio-urgent)', marginLeft: '3px' }}>*</span>}
        </label>
        {hint && <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)' }}>{hint}</span>}
      </div>
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: 'var(--prio-urgent)', marginTop: '0.3rem' }}>{error}</p>}
    </div>
  )
}

export default function NewTicketPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ customer_name: '', customer_email: '', subject: '', description: '', priority: 'Medium' })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [sending, setSending] = useState(false)

  function validate(): boolean {
    const errs: Partial<FormData> = {}
    if (!form.customer_name.trim()) errs.customer_name = 'Name is required'
    if (!form.customer_email.trim()) errs.customer_email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customer_email)) errs.customer_email = 'Enter a valid email'
    if (!form.subject.trim()) errs.subject = 'Subject is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    else if (form.description.trim().length < 10) errs.description = 'At least 10 characters required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function update(field: keyof FormData, value: string) {
    setForm({ ...form, [field]: value })
    if (errors[field]) setErrors({ ...errors, [field]: undefined })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSending(true)
    try {
      const res = await fetch('/api/tickets', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (res.ok) {
        const data = await res.json()
        toast.success(`Ticket ${data.ticket_id} created!`)
        router.push('/tickets')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to create ticket')
      }
    } catch { toast.error('Network error — please try again') }
    setSending(false)
  }

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '760px' }}>
      {/* Breadcrumb */}
      <nav className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <Link href="/tickets" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Tickets</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        <span style={{ color: 'var(--text-primary)' }}>New Ticket</span>
      </nav>

      {/* Header */}
      <div className="animate-fade-up" style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '0.25rem' }}>
          Create New Ticket
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Fill in the details below to open a new support ticket
        </p>
      </div>

      {/* Form */}
      <div className="card animate-fade-up stagger-1" style={{ overflow: 'hidden' }}>
        <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--green-700), var(--green-400), transparent)' }} />
        <form onSubmit={handleSubmit} noValidate style={{ padding: '1.75rem 2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <Field label="Customer Name" required error={errors.customer_name}>
                <input
                  type="text" value={form.customer_name} onChange={e => update('customer_name', e.target.value)}
                  placeholder="John Doe" className="input"
                  style={errors.customer_name ? { borderColor: 'var(--prio-urgent)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                />
              </Field>
              <Field label="Customer Email" required error={errors.customer_email}>
                <input
                  type="email" value={form.customer_email} onChange={e => update('customer_email', e.target.value)}
                  placeholder="john@example.com" className="input"
                  style={errors.customer_email ? { borderColor: 'var(--prio-urgent)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
                />
              </Field>
            </div>

            <hr className="divider" />

            <Field label="Issue Subject" required error={errors.subject}>
              <input
                type="text" value={form.subject} onChange={e => update('subject', e.target.value)}
                placeholder="e.g. Payment failed during checkout" className="input"
                style={errors.subject ? { borderColor: 'var(--prio-urgent)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}}
              />
            </Field>

            <Field label="Description" required hint={`${form.description.length} chars`} error={errors.description}>
              <textarea
                value={form.description} onChange={e => update('description', e.target.value)}
                placeholder="Describe the issue in detail. Include steps to reproduce, error messages, and any relevant context..."
                rows={5} className="input"
                style={{ resize: 'vertical', minHeight: '120px', ...(errors.description ? { borderColor: 'var(--prio-urgent)', boxShadow: '0 0 0 3px rgba(239,68,68,0.1)' } : {}) }}
              />
            </Field>

            <hr className="divider" />

            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.625rem' }}>Priority Level</p>
              <div style={{ display: 'flex', gap: '0.625rem', flexWrap: 'wrap' }}>
                {PRIORITIES.map(p => (
                  <button
                    key={p.value} type="button" onClick={() => update('priority', p.value)}
                    style={{
                      padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                      border: form.priority === p.value ? `1.5px solid ${p.color}` : '1.5px solid var(--border)',
                      background: form.priority === p.value ? p.bg : 'transparent',
                      color: form.priority === p.value ? p.color : 'var(--text-muted)',
                      fontFamily: 'var(--font)',
                    }}
                  >
                    {p.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', paddingTop: '0.25rem' }}>
              <Link href="/tickets" className="btn-secondary" style={{ textDecoration: 'none' }}>Cancel</Link>
              <button type="submit" disabled={sending} className="btn-primary" style={{ minWidth: '160px', justifyContent: 'center', borderRadius: 'var(--radius-full)' }}>
                {sending ? (
                  <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeOpacity={0.3} /><path d="M21 12a9 9 0 00-9-9" /></svg>Creating…</>
                ) : (
                  <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>Create Ticket</>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
