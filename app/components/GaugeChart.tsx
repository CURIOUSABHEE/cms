'use client'

type Props = {
  value: number
  closed: number
  total: number
  inProgress: number
}

export default function GaugeChart({ value, closed, total, inProgress }: Props) {
  const R = 75
  const cx = 100
  const cy = 95
  const strokeW = 16

  const circumference = Math.PI * R

  const completedFrac = total > 0 ? closed / total : 0
  const inProgressFrac = total > 0 ? inProgress / total : 0
  const pendingFrac = total > 0 ? (total - closed - inProgress) / total : 0

  const completedLen = completedFrac * circumference
  const inProgressLen = inProgressFrac * circumference
  const pendingLen = pendingFrac * circumference

  const arc = `M ${cx - R},${cy} A ${R},${R} 0 0,1 ${cx + R},${cy}`

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <svg width="200" height="110" viewBox="0 0 200 110">
          <defs>
            <pattern id="gaugeHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--border)" strokeWidth="2" />
            </pattern>
          </defs>

          {/* Hatched background (full semicircle — shows behind all segments) */}
          <path
            d={arc}
            fill="none"
            stroke="url(#gaugeHatch)"
            strokeWidth={strokeW}
            strokeLinecap="round"
          />

          {/* Completed arc (dark green) */}
          {completedLen > 0 && (
            <path
              d={arc}
              fill="none"
              stroke="var(--green-600)"
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={`${completedLen} ${circumference}`}
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          )}

          {/* In Progress arc (mint green) */}
          {inProgressLen > 0 && (
            <path
              d={arc}
              fill="none"
              stroke="var(--green-300)"
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeDasharray={`${inProgressLen} ${circumference}`}
              strokeDashoffset={-completedLen}
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            />
          )}

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
          { label: 'Completed', color: 'var(--green-600)', count: closed },
          { label: 'In Progress', color: 'var(--green-300)', count: inProgress },
          { label: 'Pending', isHatched: true, count: total - closed - inProgress },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            {(item as any).isHatched ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <defs>
                  <pattern id="legendHatch" patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                    <line x1="0" y1="0" x2="0" y2="4" stroke="var(--border)" strokeWidth="1.5" />
                  </pattern>
                </defs>
                <rect width="10" height="10" fill="url(#legendHatch)" rx="2" />
              </svg>
            ) : (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            )}
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
