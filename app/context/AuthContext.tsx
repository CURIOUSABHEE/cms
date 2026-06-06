'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type User = {
  id: string
  name: string
  email: string
  role: string
  avatarUrl?: string | null
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signin: (email: string, password: string) => Promise<string | null>
  signup: (name: string, email: string, password: string) => Promise<string | null>
  signout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/me').then(r => r.json()).then(data => {
      if (!cancelled) { setUser(data.user); setLoading(false) }
    }).catch(() => {
      if (!cancelled) { setUser(null); setLoading(false) }
    })
    return () => { cancelled = true }
  }, [])

  const signin = useCallback(async (email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) return data.error
    setUser(data.user)
    router.push('/')
    return null
  }, [router])

  const signup = useCallback(async (name: string, email: string, password: string): Promise<string | null> => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) return data.error
    setUser(data.user)
    router.push('/')
    return null
  }, [router])

  const signout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/auth/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, signin, signup, signout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
