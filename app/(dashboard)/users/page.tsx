'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type UserItem = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  avatarUrl: string | null
  createdAt: string
}

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth()
  const router = useRouter()

  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchUsers = useCallback(async (q = search) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q) params.set('search', q)
      const res = await fetch(`/api/users?${params}`)
      if (res.ok) {
        const data = await res.json()
        setUsers(Array.isArray(data) ? data : [])
      } else {
        toast.error('Failed to load users list')
      }
    } catch {
      toast.error('Network error loading users')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser || currentUser.role !== 'ADMIN') {
        toast.error('Access Denied: Administrators only')
        router.push('/')
      }
    }
  }, [currentUser, authLoading, router])

  useEffect(() => {
    if (!authLoading && currentUser?.role === 'ADMIN') {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        fetchUsers(search)
      }, 280)
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [search, authLoading, currentUser, fetchUsers])

  const handleRoleChange = async (id: string, role: string) => {
    setSavingId(id)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, role }),
      })
      if (res.ok) {
        toast.success('User role updated successfully')
        fetchUsers()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Failed to update user role')
      }
    } catch {
      toast.error('Network error updating user role')
    } finally {
      setSavingId(null)
    }
  }

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    if (id === currentUser?.id) {
      toast.error('You cannot suspend your own admin account')
      return
    }
    setSavingId(id)
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentActive }),
      })
      if (res.ok) {
        toast.success(currentActive ? 'Account suspended' : 'Account activated')
        fetchUsers()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Failed to toggle account status')
      }
    } catch {
      toast.error('Network error updating account status')
    } finally {
      setSavingId(null)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      toast.error('You cannot delete your own admin account')
      return
    }
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return
    
    setSavingId(id)
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success('User deleted successfully')
        fetchUsers()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Failed to delete user')
      }
    } catch {
      toast.error('Network error deleting user')
    } finally {
      setSavingId(null)
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          User Management
        </h1>
        <div className="skeleton" style={{ height: 400, borderRadius: 12 }} />
      </div>
    )
  }

  if (!currentUser || currentUser.role !== 'ADMIN') return null

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title & Info */}
      <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          User Administration
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage system users, change roles, suspend/activate accounts, and remove user registrations.
        </p>
      </div>

      {/* Search Bar */}
      <div
        className="card animate-fade-up stagger-1"
        style={{ padding: '0.875rem 1.25rem', marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', pointerEvents: 'none' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.25rem', borderRadius: 'var(--radius-full)' }}
          />
        </div>
        {search && (
          <button className="btn-ghost" onClick={() => setSearch('')}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear
          </button>
        )}
      </div>

      {/* Users Table Card */}
      <div className="card animate-fade-up stagger-1" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-elevated)' }}>
                {['User', 'Role', 'Status', 'Registered Date', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '0.75rem 1.25rem', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-faint)', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isSelf = u.id === currentUser.id
                const isPending = savingId === u.id
                
                return (
                  <tr key={u.id} className="table-row">
                    {/* User profile */}
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: u.role === 'ADMIN' ? 'var(--green-900)' : 'var(--status-open)',
                            color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 1px' }}>
                            {u.name} {isSelf && <span style={{ fontSize: '0.7rem', background: 'var(--green-50)', color: 'var(--green-700)', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>(You)</span>}
                          </p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role selector */}
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      {isSelf ? (
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                          {u.role.toLowerCase().replace('_', ' ')}
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          disabled={isPending}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="select"
                          style={{ padding: '0.35rem 2rem 0.35rem 0.75rem', fontSize: '0.8rem', minWidth: '140px', borderRadius: 'var(--radius-sm)' }}
                        >
                          <option value="CUSTOMER">Customer</option>
                          <option value="ADMIN">Administrator</option>
                        </select>
                      )}
                    </td>

                    {/* Account status */}
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <span
                        className={u.isActive ? 'badge badge-closed' : 'badge badge-urgent'}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '0.875rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {/* Suspend/Activate toggle */}
                        <button
                          disabled={isSelf || isPending}
                          onClick={() => handleToggleActive(u.id, u.isActive)}
                          className="btn-ghost"
                          style={{
                            fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)',
                            color: u.isActive ? 'var(--prio-high)' : 'var(--green-700)',
                            background: u.isActive ? '#FFF7ED' : 'var(--green-50)',
                            opacity: isSelf ? 0.4 : 1,
                          }}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                        
                        {/* Delete button */}
                        <button
                          disabled={isSelf || isPending}
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn-ghost"
                          style={{
                            fontSize: '0.75rem', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', border: '1px solid #FECACA',
                            color: 'var(--prio-urgent)',
                            background: '#FEF2F2',
                            opacity: isSelf ? 0.4 : 1,
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
