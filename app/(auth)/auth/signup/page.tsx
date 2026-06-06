'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/context/AuthContext'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const { signup } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = new FormData(e.currentTarget)
    const err = await signup(
      form.get('name') as string,
      form.get('email') as string,
      form.get('password') as string,
    )
    setSubmitting(false)
    if (err) toast.error(err)
  }

  return (
    <div className="card" style={{ width: '100%', maxWidth: 400, padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--green-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Create account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Get started with SupportDesk</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Name</label>
            <input
              id="name"
              name="name"
              required
              placeholder="John Doe"
              style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
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
              minLength={6}
              placeholder="At least 6 characters"
              style={{ width: '100%', padding: '0.625rem 0.875rem', background: 'var(--bg-elevated)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', fontFamily: 'var(--font)', fontSize: '0.875rem', outline: 'none' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ justifyContent: 'center', padding: '0.75rem', fontSize: '0.875rem', marginTop: '0.5rem' }}
          >
            {submitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: 'var(--green-600)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
  )
}
