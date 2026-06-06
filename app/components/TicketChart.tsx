'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

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
  // Map to day-of-week labels
  const formatted = data.map((d, i) => ({
    ...d,
    day: DAYS[i % 7],
    label: d.date.slice(5),
  }))

  // Find the highest bar index
  const maxIdx = formatted.reduce((acc, d, i) => d.count > formatted[acc].count ? i : acc, 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barGap={8}>
        <CartesianGrid strokeDasharray="0" stroke="var(--border-light)" vertical={false} />
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: 'var(--text-faint)', fontFamily: 'var(--font)', fontWeight: 500 }}
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: 'var(--text-faint)', fontFamily: 'var(--font)' }}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} cursor={false} />
        <Bar dataKey="count" radius={[12, 12, 12, 12]} maxBarSize={36}>
          {formatted.map((entry, index) => {
            const isMax = index === maxIdx && entry.count > 0
            const isEmpty = entry.count === 0
            return (
              <Cell
                key={`cell-${index}`}
                fill={
                  isMax
                    ? 'var(--green-600)'
                    : isEmpty
                    ? 'var(--border)'
                    : index % 2 === 0
                    ? 'var(--green-900)'
                    : 'var(--green-300)'
                }
                opacity={isEmpty ? 0.4 : 1}
              />
            )
          })}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
