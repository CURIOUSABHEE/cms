'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import toast from 'react-hot-toast'

type Notification = {
  id: string
  message: string
  type: string
  isRead: boolean
  createdAt: string
}

export default function Header() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications')
      if (res.ok) {
        const data = await res.json()
        setNotifications(Array.isArray(data) ? data : [])
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err)
    }
  }, [])

  useEffect(() => {
    if (!user) return
    fetchNotifications()
    const iv = setInterval(fetchNotifications, 15000)
    return () => clearInterval(iv)
  }, [user, fetchNotifications])

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setShowNotifPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PUT' })
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        toast.success('All marked as read')
      }
    } catch {
      toast.error('Failed to mark all as read')
    }
  }

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
      }
    } catch {
      console.error('Failed to mark notification as read')
    }
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

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
      {user?.role && user.role !== 'CUSTOMER' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Role: <strong style={{ color: 'var(--green-700)', textTransform: 'uppercase' }}>{user.role}</strong>
          </span>
        </div>
      )}

      <div style={{ flex: 1 }} />

      {/* Icons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', position: 'relative' }}>
        {/* Bell with notifications count */}
        <button
          className="icon-btn"
          style={{ position: 'relative' }}
          aria-label="Notifications"
          onClick={() => setShowNotifPanel(!showNotifPanel)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: 'var(--prio-urgent)',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid white',
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Panel */}
        {showNotifPanel && (
          <div
            ref={panelRef}
            className="card"
            style={{
              position: 'absolute',
              top: '45px',
              right: 0,
              width: '320px',
              maxHeight: '400px',
              overflowY: 'auto',
              zIndex: 100,
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem' }}>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--green-700)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '1rem' }}>
                  No new notifications
                </p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleMarkRead(n.id)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      background: n.isRead ? 'transparent' : 'var(--green-50)',
                      border: n.isRead ? '1px solid transparent' : '1px solid var(--green-100)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      transition: 'background 0.15s',
                    }}
                  >
                    {!n.isRead && (
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          background: 'var(--green-700)',
                          marginTop: '6px',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.78rem', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {n.message}
                      </p>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '28px', background: 'var(--border)' }} />

      {/* User */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--green-600), var(--green-900))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.875rem',
            flexShrink: 0,
          }}
        >
          {user ? user.name.charAt(0).toUpperCase() : '?'}
        </div>
        <div style={{ lineHeight: 1.3 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{user?.name ?? 'Guest'}</p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email ?? 'Not signed in'}</p>
        </div>
      </Link>
    </header>
  )
}
