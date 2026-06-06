'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { signin } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  
  const [isAdmin, setIsAdmin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleToggleAdmin = (checked: boolean) => {
    setIsAdmin(checked)
    setEmail('')
    setPassword('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const err = await signin(email, password)
    setSubmitting(false)
    if (err) toast.error(err)
  }

  return (
    <div className="card" style={{ width: '100%', maxWidth: 400, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Welcome back</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Sign in to your account</p>
        </div>

        {/* Toggle admin quick login */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', background: 'var(--bg-elevated)', padding: '0.25rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)' }}>
          <button
            type="button"
            onClick={() => handleToggleAdmin(false)}
            style={{
              flex: 1, padding: '0.45rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: !isAdmin ? 'var(--green-900)' : 'transparent',
              color: !isAdmin ? 'white' : 'var(--text-muted)'
            }}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => handleToggleAdmin(true)}
            style={{
              flex: 1, padding: '0.45rem', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: isAdmin ? 'var(--green-900)' : 'transparent',
              color: isAdmin ? 'white' : 'var(--text-muted)'
            }}
          >
            Admin Quick Login
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.875rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--green-600)', fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </p>
      </div>
  )
}
