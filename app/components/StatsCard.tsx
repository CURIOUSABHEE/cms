type Props = {
  label: string
  value: number
  delta?: number
  icon: React.ReactNode
  accentColor: string
  bgColor: string
}

export default function StatsCard({ label, value, delta, icon, accentColor, bgColor }: Props) {
  return (
    <div
      className="card stats-card animate-fade-up"
      style={{ padding: '1.25rem 1.5rem' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: bgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: accentColor,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        {delta !== undefined && (
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              color: delta >= 0 ? 'var(--status-closed)' : 'var(--prio-urgent)',
              background: delta >= 0 ? 'var(--status-closed-bg)' : 'var(--prio-urgent-bg)',
              border: `1px solid ${delta >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
              borderRadius: '999px',
              padding: '0.2rem 0.5rem',
            }}
          >
            {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)}
          </span>
        )}
      </div>

      {/* Value */}
      <p
        style={{
          fontSize: '2rem',
          fontWeight: 700,
          lineHeight: 1,
          color: accentColor,
          fontVariantNumeric: 'tabular-nums',
          marginBottom: '0.375rem',
        }}
      >
        {value.toLocaleString()}
      </p>

      {/* Label */}
      <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  )
}
