'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/context/AuthContext'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

type Category = {
  id: string
  name: string
  description: string | null
}

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  // New Category Form
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      } else {
        toast.error('Failed to load categories')
      }
    } catch {
      toast.error('Network error loading categories')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        toast.error('Access Denied: Administrators only')
        router.push('/')
      } else {
        fetchCategories()
      }
    }
  }, [user, authLoading, router, fetchCategories])

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() }),
      })
      if (res.ok) {
        toast.success('Category created successfully')
        setName('')
        setDescription('')
        fetchCategories()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Failed to create category')
      }
    } catch {
      toast.error('Network error creating category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        toast.success('Category deleted')
        fetchCategories()
      } else {
        const errData = await res.json()
        toast.error(errData.error || 'Failed to delete category')
      }
    } catch {
      toast.error('Network error deleting category')
    }
  }

  if (authLoading || loading) {
    return (
      <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
          Categories
        </h1>
        <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div style={{ padding: '1.75rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
          Category Settings
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Manage your support ticket categories. Categories help agents classify and sort support requests.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }} className="lg:grid-cols-[1fr_2fr]">
        
        {/* CREATE CATEGORY CARD */}
        <div className="card animate-fade-up stagger-1" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            New Category
          </h2>
          <form onSubmit={handleCreateCategory} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Category Name
              </label>
              <input
                type="text"
                placeholder="e.g. Billing & Payments"
                value={name}
                onChange={e => setName(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Description
              </label>
              <textarea
                placeholder="Describe what this category is for..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                className="input"
                style={{ resize: 'vertical', fontFamily: 'var(--font)' }}
              />
            </div>
            <button type="submit" disabled={submitting || !name.trim()} className="btn-primary" style={{ justifyContent: 'center' }}>
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* CATEGORIES LIST CARD */}
        <div className="card animate-fade-up stagger-2" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            All Categories ({categories.length})
          </h2>
          
          {categories.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--text-faint)' }}>
              No categories registered yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {categories.map(cat => (
                <div
                  key={cat.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '1rem', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)', gap: '1rem'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {cat.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                      {cat.description || 'No description provided.'}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="btn-ghost"
                      style={{ color: 'var(--prio-urgent)', border: '1px solid #FECACA', background: '#FEF2F2', padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
