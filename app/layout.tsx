import type { Metadata } from 'next'
import './globals.css'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'SupportDesk — Customer Support CRM',
  description: 'Professional customer support ticketing and CRM system.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
        {/* Sidebar */}
        <Sidebar />

        {/* Right panel: header + content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
          <Header />
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {children}
          </main>
        </div>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#fff',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontFamily: 'var(--font)',
              fontSize: '0.875rem',
              boxShadow: 'var(--shadow-md)',
            },
            success: { iconTheme: { primary: 'var(--green-600)', secondary: '#fff' } },
            error:   { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
