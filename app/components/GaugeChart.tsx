'use client'

type Props = {
  value: number   // 0-100
  closed: number
  total: number
  inProgress: number
}

export default function GaugeChart({ value, closed, total, inProgress }: Props) {
  // SVG semicircle gauge
  const R = 75
  const cx = 100
  const cy = 95
  const strokeW = 16

  // Arc math
  const circumference = Math.PI * R
  const progress = (value / 100) * circumference

  // Background arc (full semicircle)
  const bgArc = `M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`
  // Foreground arc (progress)
  const fgArc = `M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* Hatched background arc */}
          <defs>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--border)" strokeWidth="2" />
            </pattern>
            <clipPath id="gauge-clip">
              <rect x="0" y="0" width="200" height="110" />
            </clipPath>
          </defs>

          {/* Background track */}
          <path
            d={bgArc}
            fill="none"
            stroke="url(#hatch)"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />

          {/* Closed (green) arc */}
          <path
            d={fgArc}
            fill="none"
            stroke="var(--green-600)"
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
            style={{ transition: 'stroke-dasharray 1s ease-out' }}
          />

          {/* Center text */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            fontSize="26"
            fontWeight="800"
            fill="var(--text-primary)"
            fontFamily="var(--font)"
          >
            {value}%
          </text>
          <text
            x={cx}
            y={cy + 12}
            textAnchor="middle"
            fontSize="11"
            fill="var(--text-muted)"
            fontFamily="var(--font)"
          >
            Resolution Rate
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
        {[
          { label: 'Resolved', color: 'var(--green-600)', count: closed },
          { label: 'In Progress', color: 'var(--green-300)', count: inProgress },
          { label: 'Pending', color: 'var(--border)', count: total - closed - inProgress },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
