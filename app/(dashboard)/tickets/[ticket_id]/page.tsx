'use client'

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import StatusBadge from '../../../components/StatusBadge'
import PriorityBadge from '../../../components/PriorityBadge'
import toast from 'react-hot-toast'
import { useAuth } from '../../../context/AuthContext'

type CommentAuthor = {
  id: string
  name: string
  role: string
  avatarUrl?: string | null
}

type TicketComment = {
  id: string
  message: string
  isInternal: boolean
  createdAt: string
  author: CommentAuthor
}

type StatusHistoryItem = {
  id: string
  oldStatus: string
  newStatus: string
  createdAt: string
  changedBy: {
    name: string
    role: string
  }
}

type Attachment = {
  id: string
  fileUrl: string
  fileName: string
  uploader: {
    name: string
  }
  createdAt: string
}

type TicketDetail = {
  id: string
  ticketNumber: string
  subject: string
  description: string
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  }
  agent?: {
    id: string
    name: string
    email: string
    avatarUrl?: string | null
  } | null
  category: {
    id: string
    name: string
  }
  comments: TicketComment[]
  statusHistory: StatusHistoryItem[]
  attachments: Attachment[]
}

type AgentUser = {
  id: string
  name: string
  role: string
}

function SkeletonDetail() {
  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="skeleton" style={{ width: 200, height: 14, borderRadius: 4, marginBottom: '1.5rem' }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <div className="skeleton" style={{ width: 300, height: 22, borderRadius: 4, marginBottom: '0.75rem' }} />
          <div className="skeleton" style={{ width: 180, height: 14, borderRadius: 4, marginBottom: '1.5rem' }} />
          <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  )
}

export default function TicketDetailPage({ params }: { params: Promise<{ ticket_id: string }> }) {
  const { ticket_id } = use(params)
  const { user } = useAuth()
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Edit Form state
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [assignedAgentId, setAssignedAgentId] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Comment Form state
  const [commentText, setCommentText] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [submittingComment, setSubmittingComment] = useState(false)
  
  // Agents List (Staff only)
  const [agents, setAgents] = useState<AgentUser[]>([])
  
  // Attachment upload simulation
  const [mockFileName, setMockFileName] = useState('')
  const [addingAttachment, setAddingAttachment] = useState(false)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`)
      if (res.status === 404) {
        setNotFound(true)
        setLoading(false)
        return
      }
      if (!res.ok) {
        toast.error('Failed to load ticket')
        setLoading(false)
        return
      }
      const data: TicketDetail = await res.json()
      setTicket(data)
      setStatus(data.status)
      setPriority(data.priority)
      setAssignedAgentId(data.agent?.id || 'unassigned')
    } catch {
      toast.error('Network error loading ticket')
    } finally {
      setLoading(false)
    }
  }, [ticket_id])

  const fetchAgents = useCallback(async () => {
    if (!user || user.role === 'CUSTOMER') return
    try {
      const res = await fetch('/api/users')
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setAgents(data.filter((u: AgentUser) => u.role === 'ADMIN'))
        }
      }
    } catch (err) {
      console.error('Failed to fetch agents', err)
    }
  }, [user])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  useEffect(() => {
    fetchAgents()
  }, [fetchAgents])

  const handleUpdateMetadata = async () => {
    setSavingMeta(true)
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          priority,
          assignedAgentId: assignedAgentId === 'unassigned' ? null : assignedAgentId,
        }),
      })
      if (res.ok) {
        toast.success('Ticket updated successfully')
        fetchTicket()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Failed to update ticket')
      }
    } catch {
      toast.error('Network error updating ticket')
    } finally {
      setSavingMeta(false)
    }
  }

  const handleClaimTicket = async () => {
    if (!user) return
    setSavingMeta(true)
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedAgentId: user.id,
        }),
      })
      if (res.ok) {
        toast.success('You claimed this ticket')
        fetchTicket()
      } else {
        toast.error('Failed to claim ticket')
      }
    } catch {
      toast.error('Network error claiming ticket')
    } finally {
      setSavingMeta(false)
    }
  }

  const handleCloseTicketCustomer = async () => {
    setSavingMeta(true)
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CLOSED' }),
      })
      if (res.ok) {
        toast.success('Ticket closed successfully')
        fetchTicket()
      } else {
        toast.error('Failed to close ticket')
      }
    } catch {
      toast.error('Network error closing ticket')
    } finally {
      setSavingMeta(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentMessage: commentText.trim(),
          isInternal: user?.role === 'CUSTOMER' ? false : isInternal,
        }),
      })
      if (res.ok) {
        toast.success('Comment added')
        setCommentText('')
        fetchTicket()
      } else {
        toast.error('Failed to add comment')
      }
    } catch {
      toast.error('Network error adding comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleAddMockAttachment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mockFileName.trim()) return
    setAddingAttachment(true)
    try {
      const res = await fetch(`/api/tickets/${ticket_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachments: [
            {
              fileName: mockFileName.trim(),
              fileUrl: `/uploads/${encodeURIComponent(mockFileName.trim())}`,
            }
          ]
        }),
      })
      if (res.ok) {
        toast.success('Mock attachment uploaded')
        setMockFileName('')
        fetchTicket()
      } else {
        toast.error('Failed to upload attachment')
      }
    } catch {
      toast.error('Network error uploading attachment')
    } finally {
      setAddingAttachment(false)
    }
  }

  const copyId = async () => {
    if (!ticket) return
    await navigator.clipboard.writeText(ticket.id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Ticket ID Copied!')
  }

  if (notFound) {
    return (
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <div className="card empty-state" style={{ padding: '4rem 2rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--prio-urgent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚠️</div>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Ticket not found</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>The requested ticket does not exist or you do not have permission to view it.</p>
          <Link href="/" className="btn-primary" style={{ textDecoration: 'none' }}>← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  if (loading || !ticket) return <SkeletonDetail />

  const isCustomer = user?.role === 'CUSTOMER'
  const isDirty = status !== ticket.status || priority !== ticket.priority || assignedAgentId !== (ticket.agent?.id || 'unassigned')

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Breadcrumbs */}
      <nav className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Dashboard</Link>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
        {!isCustomer && (
          <>
            <Link href="/tickets" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Tickets</Link>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </>
        )}
        <span className="ticket-id">{ticket.ticketNumber}</span>
      </nav>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', alignItems: 'flex-start' }} className="xl:grid-cols-[2fr_1fr]">
        
        {/* LEFT COLUMN: Ticket details & Comments */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Main Details Card */}
          <div className="card animate-fade-up" style={{ overflow: 'hidden' }}>
            <div style={{ height: '4px', background: 'linear-gradient(90deg, var(--green-700), var(--green-400), transparent)' }} />
            <div style={{ padding: '1.75rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.5rem', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
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
                      title="Click to copy full ID"
                    >
                      {ticket.ticketNumber}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        {copied
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        }
                      </svg>
                    </button>
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span style={{ fontSize: '0.78rem', background: 'var(--bg-hover)', color: 'var(--text-secondary)', padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
                      Category: <strong>{ticket.category.name}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.5rem' }}>
                  Description
                </p>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem' }}>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {ticket.description}
                  </p>
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-faint)', marginBottom: '0.5rem' }}>
                  Attachments ({ticket.attachments.length})
                </p>
                {ticket.attachments.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr md:grid-cols-2', gap: '0.5rem', marginBottom: '1rem' }}>
                    {ticket.attachments.map(att => (
                      <div
                        key={att.id}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '0.5rem 0.75rem', background: 'var(--bg-elevated)',
                          border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: '1rem' }}>📁</span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={att.fileName}>
                            {att.fileName}
                          </span>
                        </div>
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--green-700)', textDecoration: 'none', fontWeight: 600, marginLeft: '0.5rem' }}
                        >
                          Download
                        </a>
                      </div>
                    ))}
                  </div>
                )}
                {/* Upload Simulated Attachment */}
                <form onSubmit={handleAddMockAttachment} style={{ display: 'flex', gap: '0.5rem', maxWidth: '400px' }}>
                  <input
                    type="text"
                    placeholder="Attach mock file (e.g. screenshot.png)..."
                    value={mockFileName}
                    onChange={e => setMockFileName(e.target.value)}
                    className="input"
                    style={{ fontSize: '0.78rem', height: '36px', borderRadius: 'var(--radius-full)' }}
                  />
                  <button
                    type="submit"
                    disabled={addingAttachment || !mockFileName.trim()}
                    className="btn-green-outline"
                    style={{ fontSize: '0.75rem', padding: '0 1rem', height: '36px', flexShrink: 0 }}
                  >
                    {addingAttachment ? 'Adding...' : 'Attach'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Comments Feed & Compose section */}
          <div className="card animate-fade-up stagger-1" style={{ padding: '1.75rem 2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Conversation
              {ticket.comments.length > 0 && (
                <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: '999px', padding: '1px 8px' }}>
                  {ticket.comments.length}
                </span>
              )}
            </h2>

            {/* Comment Thread */}
            {ticket.comments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {ticket.comments.map(comment => {
                  const isCommentInternal = comment.isInternal
                  const isAuthorStaff = comment.author.role !== 'CUSTOMER'
                  
                  return (
                    <div
                      key={comment.id}
                      style={{
                        padding: '1rem',
                        background: isCommentInternal ? '#FFFBEB' : 'var(--bg-elevated)',
                        border: isCommentInternal ? '1px solid #FDE68A' : '1px solid var(--border-light)',
                        borderLeft: isCommentInternal ? '4px solid #F59E0B' : (isAuthorStaff ? '4px solid var(--green-600)' : '4px solid var(--status-open)'),
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div
                            style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              background: isAuthorStaff ? 'var(--green-800)' : 'var(--status-open)',
                              color: '#fff', fontWeight: 700, fontSize: '0.75rem',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {comment.author.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                              {comment.author.name}
                            </span>
                            <span
                              style={{
                                marginLeft: '0.375rem', fontSize: '0.65rem', fontWeight: 600, padding: '1px 5px', borderRadius: '4px',
                                background: isAuthorStaff ? 'var(--green-50)' : 'var(--status-open-bg)',
                                color: isAuthorStaff ? 'var(--green-700)' : 'var(--status-open)',
                                textTransform: 'uppercase'
                              }}
                            >
                              {comment.author.role.replace('_', ' ')}
                            </span>
                            {isCommentInternal && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', background: '#FEF3C7', color: '#D97706', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', border: '1px solid #FCD34D' }}>
                                🔒 INTERNAL NOTE
                              </span>
                            )}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(comment.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                        {comment.message}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '2rem', background: 'var(--bg-elevated)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.5rem', color: 'var(--text-faint)' }}>
                No messages in this ticket yet.
              </div>
            )}

            {/* Post comment form */}
            <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {!isCustomer && (
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsInternal(false)}
                    style={{
                      background: 'none', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      color: !isInternal ? 'var(--green-700)' : 'var(--text-muted)',
                      borderBottom: !isInternal ? '2px solid var(--green-700)' : 'none',
                    }}
                  >
                    💬 Public Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsInternal(true)}
                    style={{
                      background: 'none', border: 'none', padding: '0.35rem 0.75rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
                      color: isInternal ? '#D97706' : 'var(--text-muted)',
                      borderBottom: isInternal ? '2px solid #D97706' : 'none',
                    }}
                  >
                    🔒 Internal Note (Visible to Agents Only)
                  </button>
                </div>
              )}
              
              <div style={{ position: 'relative' }}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={isInternal ? "Type your internal notes here..." : "Type your message to the customer..."}
                  rows={4}
                  className="input"
                  style={{ resize: 'vertical', fontFamily: 'var(--font)' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="btn-primary"
                  style={{
                    background: isInternal ? '#D97706' : 'var(--green-900)',
                    opacity: !commentText.trim() || submittingComment ? 0.6 : 1
                  }}
                >
                  {submittingComment ? 'Sending...' : (isInternal ? 'Post Internal Note' : 'Send Message')}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar (Metadata forms & Ticket Timeline history) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Metadata Controller Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Ticket Management
            </h3>

            {isCustomer ? (
              // Customer metadata actions
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <StatusBadge status={ticket.status} />
</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Priority:</span>
                  <PriorityBadge priority={ticket.priority} />
                </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
                   <span style={{ color: 'var(--text-muted)' }}>Assigned Staff:</span>
                   <span style={{ fontWeight: 600 }}>{ticket.agent?.name || 'Awaiting assignment'}</span>
                 </div>
                
                {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                  <button
                    onClick={handleCloseTicketCustomer}
                    disabled={savingMeta}
                    className="btn-secondary"
                    style={{ width: '100%', borderColor: 'var(--prio-urgent)', color: 'var(--prio-urgent)', justifyContent: 'center' }}
                  >
                    {savingMeta ? 'Closing...' : 'Close Ticket'}
                  </button>
                )}
              </div>
            ) : (
              // Agent & Admin metadata controllers
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Claim Quick Button */}
                {(!ticket.agent || ticket.agent.id !== user?.id) && (
                  <button
                    onClick={handleClaimTicket}
                    disabled={savingMeta}
                    className="btn-green-outline"
                    style={{ width: '100%', justifyContent: 'center', fontSize: '0.8rem' }}
                  >
                    🙋 Claim Ticket
                  </button>
                )}

                {/* Status selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_FOR_CUSTOMER">Waiting For Customer</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                {/* Priority selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value)}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>

                {/* Assigned Agent dropdown */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    Assigned Staff
                  </label>
                  <select
                    value={assignedAgentId}
                    onChange={e => setAssignedAgentId(e.target.value)}
                    className="select"
                    style={{ width: '100%' }}
                  >
                    <option value="unassigned">Unassigned</option>
                    {agents.map(a => (
                      <option key={a.id} value={a.id}>{a.name} (Admin)</option>
                    ))}
                  </select>
                </div>

                {/* Save metadata button */}
                <button
                  onClick={handleUpdateMetadata}
                  disabled={savingMeta || !isDirty}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', opacity: !isDirty || savingMeta ? 0.6 : 1 }}
                >
                  {savingMeta ? 'Saving Changes...' : 'Save Settings'}
                </button>
              </div>
            )}
          </div>

          {/* Ticket Timeline History Card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              Ticket History Log
            </h3>
            
            {ticket.statusHistory.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', paddingLeft: '1rem', borderLeft: '1.5px solid var(--border)' }}>
                {ticket.statusHistory.map((history, idx) => {
                  const isChange = history.oldStatus !== history.newStatus
                  return (
                    <div key={history.id} style={{ position: 'relative', fontSize: '0.78rem', lineHeight: 1.4 }}>
                      {/* Bullet point indicator */}
                      <div
                        style={{
                          position: 'absolute', left: '-22px', top: '4px',
                          width: '9px', height: '9px', borderRadius: '50%',
                          background: idx === ticket.statusHistory.length - 1 ? 'var(--green-700)' : 'var(--text-faint)',
                          border: '2px solid white'
                        }}
                      />
                      <p style={{ color: 'var(--text-primary)', fontWeight: 600, margin: 0 }}>
                        {isChange ? (
                          <>Status updated: <span style={{ textTransform: 'capitalize' }}>{history.oldStatus.toLowerCase().replace('_', ' ')}</span> → <strong style={{ color: 'var(--green-800)' }}>{history.newStatus.toLowerCase().replace('_', ' ')}</strong></>
                        ) : (
                          <>Ticket created</>
                        )}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '1px 0 0' }}>
                        By {history.changedBy.name} ({history.changedBy.role === 'CUSTOMER' ? 'Customer' : 'Staff'})
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                        {new Date(history.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-faint)', margin: 0 }}>
                No history entries recorded yet.
              </p>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
