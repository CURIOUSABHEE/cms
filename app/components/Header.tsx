'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

export default function Header() {
  const [search, setSearch] = useState('')
  const [openCount, setOpenCount] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(d => setOpenCount(d?.byStatus?.Open ?? 0))
      .catch(() => {})
  }, [])

  // ⌘F shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur()
        setSearch('')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-light)',
        padding: '0.875rem 1.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Search */}
      <div style={{ flex: 1, maxWidth: '340px', position: 'relative' }}>
        <svg
          width="14" height="14"
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          style={{
            position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-faint)', pointerEvents: 'none',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search task..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '0.5rem 3rem 0.5rem 2.25rem',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font)',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'border-color 0.18s, box-shadow 0.18s',
          }}
          onFocus={e => {
            e.target.style.borderColor = 'var(--green-400)'
            e.target.style.boxShadow = '0 0 0 3px rgba(64,145,108,0.12)'
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)'
            e.target.style.boxShadow = 'none'
          }}
        />
        {/* Shortcut hint */}
        <div
          style={{
            position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            display: 'flex', alignItems: 'center', gap: '2px',
          }}
        >
          <kbd
            style={{
              fontSize: '0.65rem', fontFamily: 'var(--font)', color: 'var(--text-faint)',
              background: 'var(--border-light)', border: '1px solid var(--border)',
              borderRadius: '4px', padding: '1px 5px', lineHeight: 1.5,
            }}
          >
            ⌘F
          </kbd>
        </div>
      </div>

      <div style={{ flex: 1 }} />

      {/* Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Mail */}
        <button className="icon-btn" aria-label="Messages">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Bell with open tickets count */}
        <button className="icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {openCount > 0 && (
            <span
              style={{
                position: 'absolute', top: '4px', right: '4px',
                width: '7px', height: '7px',
                background: 'var(--prio-urgent)', borderRadius: '50%',
                border: '1.5px solid white',
              }}
            />
          )}
        </button>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />

      {/* User */}
      <Link href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-600), var(--green-900))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0,
          }}
        >
          SD
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Support Admin</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>admin@support.com</p>
        </div>
      </Link>
    </header>
  )
}
