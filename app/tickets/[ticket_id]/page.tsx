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

export default function TicketDetailPage({ params }: { params: Promise<{ ticket_id: string }> }) {
  const { ticket_id } = use(params)
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

  async function fetchTicket() {
    const res = await fetch(`/api/tickets/${ticket_id}`)
    if (!res.ok) return setTicket(null)
    const data = await res.json()
    setTicket(data)
    setStatus(data.status)
    setPriority(data.priority)
  }

  useEffect(() => { fetchTicket() }, [ticket_id])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/tickets/${ticket_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, priority }),
    })
    if (res.ok) {
      toast.success('Ticket updated')
      fetchTicket()
    } else {
      toast.error('Failed to update')
    }
    setSaving(false)
  }

  async function copyId() {
    await navigator.clipboard.writeText(ticket_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Copied!')
  }

  if (!ticket) return <div className="text-gray-500 dark:text-gray-400">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        <Link href="/tickets" className="hover:text-blue-600 dark:hover:text-blue-400">Tickets</Link>
        <span>/</span>
        <span className="text-gray-900 dark:text-white font-medium">{ticket.ticket_id}</span>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{ticket.subject}</h2>
              <button
                onClick={copyId}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                title="Copy ticket ID"
              >
                {copied ? '✓' : '📋'}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {ticket.customer_name} &lt;{ticket.customer_email}&gt;
            </p>
          </div>
          <div className="flex gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{ticket.description}</p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-end sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>

        <div className="mt-6 flex gap-6 text-xs text-gray-400 dark:text-gray-500">
          <span>Created: {new Date(ticket.created_at).toLocaleString()}</span>
          <span>Updated: {new Date(ticket.updated_at).toLocaleString()}</span>
        </div>
      </div>

      <NotesSection ticketId={ticket_id} notes={ticket.notes} />
    </div>
  )
}
