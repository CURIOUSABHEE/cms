export default function Loading() {
  return (
    <div style={{ padding: '2rem 2.5rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* Header skeleton */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="skeleton" style={{ width: 80, height: 12, borderRadius: 4, marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: 200, height: 28, borderRadius: 4, marginBottom: '0.5rem' }} />
        <div className="skeleton" style={{ width: 280, height: 14, borderRadius: 4 }} />
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem', marginBottom: '1.75rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
            </div>
            <div className="skeleton" style={{ width: '48px', height: '28px', borderRadius: '4px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '80px', height: '14px', borderRadius: '4px' }} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem' }}>
            <div className="skeleton" style={{ width: 200, height: 18, borderRadius: 4, marginBottom: '1.25rem' }} />
            <div className="skeleton" style={{ height: 220, borderRadius: 8 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
