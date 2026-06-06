'use client'

import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Props = { data: { date: string; count: number }[] }

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-hover)',
        borderRadius: '8px',
        padding: '0.625rem 0.875rem',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        fontFamily: 'var(--font-display)',
      }}
    >
      <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginBottom: '0.25rem' }}>{label}</p>
      <p style={{ color: 'var(--accent-light)', fontWeight: 700, fontSize: '1.1rem' }}>
        {payload[0].value} ticket{payload[0].value !== 1 ? 's' : ''}
      </p>
    </div>
  )
}

export default function BarChart({ data }: Props) {
  const formatted = data.map((d) => ({ ...d, date: d.date.slice(5) }))
  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsBar data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.08)' }} />
        <Bar
          dataKey="count"
          fill="url(#barGradient)"
          radius={[4, 4, 0, 0]}
          maxBarSize={40}
        />
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.6} />
          </linearGradient>
        </defs>
      </RechartsBar>
    </ResponsiveContainer>
  )
}
