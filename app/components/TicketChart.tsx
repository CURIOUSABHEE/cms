'use client'

import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Props = { data: { date: string; created: number; resolved: number }[] }

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { payload: { fullDay: string; created: number; resolved: number } }[] }) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '0.625rem 0.875rem',
        boxShadow: 'var(--shadow-md)',
        fontFamily: 'var(--font)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.25rem',
      }}
    >
      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, margin: 0 }}>
        {data.fullDay}
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', fontSize: '0.825rem' }}>
        <p style={{ color: 'var(--green-900)', fontWeight: 700, margin: 0 }}>
          Created: {data.created}
        </p>
        <p style={{ color: 'var(--green-500)', fontWeight: 700, margin: 0 }}>
          Resolved: {data.resolved}
        </p>
      </div>
    </div>
  )
}

export default function TicketChart({ data }: Props) {
  const formatted = data.map((d) => {
    const [year, month, day] = d.date.split('-').map(Number)
    const dateObj = new Date(year, month - 1, day)
    const fullDay = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
    const dayInitial = dateObj.toLocaleDateString('en-US', { weekday: 'narrow' })
    return {
      ...d,
      day: dayInitial,
      fullDay,
      label: d.date.slice(5),
    }
  })

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={2}>
        <CartesianGrid strokeDasharray="0" stroke="var(--border-light)" vertical={false} horizontal={false} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'var(--text-faint)', fontFamily: 'var(--font)', fontWeight: 500 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="created" radius={[12, 12, 12, 12]} barSize={12} minPointSize={6}>
          {formatted.map((entry, index) => (
            <Cell key={`cell-created-${index}`} fill={entry.created === 0 ? 'var(--border-light)' : 'var(--green-900)'} />
          ))}
        </Bar>
        <Bar dataKey="resolved" radius={[12, 12, 12, 12]} barSize={12} minPointSize={6}>
          {formatted.map((entry, index) => (
            <Cell key={`cell-resolved-${index}`} fill={entry.resolved === 0 ? 'var(--border-light)' : 'var(--green-300)'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
