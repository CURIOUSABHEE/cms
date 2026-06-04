'use client'

import { useState, useEffect, useCallback } from 'react'
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

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchTickets = useCallback(async () => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (statusFilter) params.set('status', statusFilter)
    if (priorityFilter) params.set('priority', priorityFilter)
    const res = await fetch(`/api/tickets?${params}`)
    const data = await res.json()
    setTickets(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [search, statusFilter, priorityFilter])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  useEffect(() => {
    const interval = setInterval(fetchTickets, 30000)
    return () => clearInterval(interval)
  }, [fetchTickets])

  function exportCSV() {
    const headers = ['Ticket ID', 'Customer Name', 'Customer Email', 'Subject', 'Description', 'Status', 'Priority', 'Created At']
    const rows = tickets.map((t) => [
      t.ticket_id, t.customer_name, t.customer_email, t.subject, t.description, t.status, t.priority, t.created_at,
    ])
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tickets.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">
            Export CSV
          </button>
          <Link
            href="/tickets/new"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            + Create Ticket
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name, email, ID, subject..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setLoading(true) }}
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setLoading(true) }}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => { setPriorityFilter(e.target.value); setLoading(true) }}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">Loading...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-gray-400">No tickets found.</td></tr>
              ) : tickets.map((t) => (
                <tr key={t.ticket_id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-4">
                    <Link href={`/tickets/${t.ticket_id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {t.ticket_id}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{t.customer_name}</td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 max-w-xs truncate">{t.subject}</td>
                  <td className="py-3 px-4"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-4"><PriorityBadge priority={t.priority} /></td>
                  <td className="py-3 px-4 text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">
                    {new Date(t.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
