'use client'

import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type Props = { data: { date: string; count: number }[] }

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        padding: '0.5rem 0.875rem',
        boxShadow: 'var(--shadow-md)',
        fontFamily: 'var(--font)',
      }}
    >
      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '2px' }}>{label}</p>
      <p style={{ color: 'var(--green-900)', fontWeight: 700, fontSize: '1rem' }}>
        {payload[0].value} tickets
      </p>
    </div>
  )
}

export default function TicketChart({ data }: Props) {
  const formatted = data.map((d, i) => ({
    ...d,
    day: DAYS[i % 7],
    label: d.date.slice(5),
  }))

  const sortedByCount = formatted
    .map((d, i) => ({ ...d, index: i }))
    .sort((a, b) => b.count - a.count)
  const peakIdx = sortedByCount[0]?.index ?? 0
  const secondIdx = sortedByCount.length > 1 ? sortedByCount[1].index : 0

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={8}>
        <defs>
          <pattern id="barHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--border)" strokeWidth="2" />
          </pattern>
        </defs>
        <CartesianGrid strokeDasharray="0" stroke="var(--border-light)" vertical={false} horizontal={false} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'var(--text-faint)', fontFamily: 'var(--font)', fontWeight: 500 }}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="count" radius={[12, 12, 12, 12]} maxBarSize={36}>
          {formatted.map((entry, index) => {
            if (entry.count === 0) return <Cell key={`cell-${index}`} fill="url(#barHatch)" opacity={0.4} />
            if (index === peakIdx) return <Cell key={`cell-${index}`} fill="var(--green-600)" />
            if (index === secondIdx) return <Cell key={`cell-${index}`} fill="var(--green-300)" />
            return <Cell key={`cell-${index}`} fill="url(#barHatch)" />
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
