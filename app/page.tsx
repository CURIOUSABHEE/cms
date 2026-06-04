'use client'

import { useState, useEffect } from 'react'
import StatsCard from './components/StatsCard'
import StatusBadge from './components/StatusBadge'
import PriorityBadge from './components/PriorityBadge'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const BarChart = dynamic(() => import('./components/BarChart'), { ssr: false })
const PieChart = dynamic(() => import('./components/PieChart'), { ssr: false })

type Ticket = {
  ticket_id: string
  customer_name: string
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

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [recent, setRecent] = useState<Ticket[]>([])

  async function fetchData() {
    const [a, t] = await Promise.all([
      fetch('/api/analytics').then((r) => r.json()),
      fetch('/api/tickets').then((r) => r.json()),
    ])
    setAnalytics(a)
    setRecent(Array.isArray(t) ? t.slice(0, 5) : [])
  }

  useEffect(() => { fetchData() }, [])

  if (!analytics) return <div className="text-gray-500 dark:text-gray-400">Loading...</div>

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Tickets" value={analytics.total} color="text-gray-900 dark:text-white" />
        <StatsCard label="Open" value={analytics.byStatus.Open || 0} color="text-blue-600" />
        <StatsCard label="In Progress" value={analytics.byStatus['In Progress'] || 0} color="text-yellow-600" />
        <StatsCard label="Closed" value={analytics.byStatus.Closed || 0} color="text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Tickets Created (Last 7 Days)</h3>
          <BarChart data={analytics.ticketsPerDay} />
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Priority Breakdown</h3>
          <PieChart data={analytics.byPriority} />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Tickets</h3>
          <Link href="/tickets" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">ID</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Customer</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Subject</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left py-3 px-2 font-medium text-gray-500 dark:text-gray-400">Priority</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((t) => (
                <tr key={t.ticket_id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-3 px-2">
                    <Link href={`/tickets/${t.ticket_id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">{t.ticket_id}</Link>
                  </td>
                  <td className="py-3 px-2 text-gray-700 dark:text-gray-300">{t.customer_name}</td>
                  <td className="py-3 px-2 text-gray-700 dark:text-gray-300 max-w-xs truncate">{t.subject}</td>
                  <td className="py-3 px-2"><StatusBadge status={t.status} /></td>
                  <td className="py-3 px-2"><PriorityBadge priority={t.priority} /></td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-gray-400">No tickets yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
