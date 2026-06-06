'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/context/AuthContext'

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signout } = useAuth()

  const menuItems = [
    {
      href: '/',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    // Tickets list is for Admin
    ...(user?.role === 'ADMIN' ? [
      {
        href: '/tickets',
        label: 'Tickets',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      }
    ] : []),
    // New Ticket is for all (Customers or on-behalf creation)
    {
      href: '/tickets/new',
      label: 'New Ticket',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    // User management (Admin only)
    ...(user?.role === 'ADMIN' ? [
      {
        href: '/users',
        label: 'Users',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
      {
        href: '/categories',
        label: 'Categories',
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
      }
    ] : []),
  ]

  const generalItems = [
    {
      href: '#',
      label: 'Help',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ]

  return (
    <aside
      style={{
        width: '220px',
        minHeight: '100vh',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        height: '100vh',
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--green-900)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            SupportDesk
          </span>
        </div>
      </div>

      {/* Menu section */}
      <div style={{ padding: '0.75rem 1rem', flex: 1 }}>
        <p className="section-label" style={{ padding: '0 0.25rem', marginBottom: '0.5rem' }}>Menu</p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {menuItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '/tickets/new')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <span style={{ flexShrink: 0 }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* General section */}
        <p className="section-label" style={{ padding: '0 0.25rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>
          General
        </p>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {generalItems.map((item) => (
            <a key={item.label} href={item.href} className="nav-item">
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <span>{item.label}</span>
            </a>
          ))}
          <a
            href="#"
            className="nav-item"
            onClick={(e) => { e.preventDefault(); signout() }}
          >
            <span style={{ flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            <span>Sign Out</span>
          </a>
        </nav>
      </div>

      {/* Download card */}
      <div style={{ padding: '1rem' }}>
        <div
          style={{
            background: 'var(--green-900)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-30px',
              right: '-10px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
            }}
          />
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem', lineHeight: 1.3 }}>
            Download our<br />Mobile App
          </p>
          <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.875rem' }}>
            Get easy in another way
          </p>
          <button
            style={{
              width: '100%',
              padding: '0.5rem',
              background: 'var(--green-500)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--font)',
              transition: 'background 0.15s',
            }}
          >
            Download
          </button>
        </div>
      </div>
    </aside>
  )
}
