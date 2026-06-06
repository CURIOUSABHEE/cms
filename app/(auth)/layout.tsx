export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', width: '100%', background: 'var(--bg-base)', padding: '1rem' }}>
      {children}
    </div>
  )
}
