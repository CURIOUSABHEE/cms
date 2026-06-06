'use client'

import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

type Props = { data: Record<string, number> }

const COLORS = {
  Urgent: '#ef4444',
  High:   '#f97316',
  Medium: '#eab308',
  Low:    '#22c55e',
}

function CustomTooltip({ active, payload }: any) {
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
      <p style={{ color: payload[0].payload.fill, fontWeight: 700, fontSize: '0.875rem' }}>
        {payload[0].name}: {payload[0].value}
      </p>
    </div>
  )
}

function CustomLegend({ payload }: any) {
  return (
    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '0.75rem' }}>
      {payload.map((entry: any) => (
        <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color, display: 'block' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{entry.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function PieChart({ data }: Props) {
  const entries = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  if (entries.length === 0) {
    return (
      <div
        style={{
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.875rem',
        }}
      >
        No data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RechartsPie>
        <Pie
          data={entries}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={85}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {entries.map((entry) => (
            <Cell
              key={entry.name}
              fill={(COLORS as Record<string, string>)[entry.name] ?? '#7c3aed'}
              opacity={0.9}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </RechartsPie>
    </ResponsiveContainer>
  )
}
