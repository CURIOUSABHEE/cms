'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

type Note = { id: string; note_text: string; created_at: string }

export default function NotesSection({
  ticketId,
  notes: initialNotes,
}: {
  ticketId: string
  notes: Note[]
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note_text: text.trim() }),
      })
      if (res.ok) {
        const newNote: Note = { id: crypto.randomUUID(), note_text: text.trim(), created_at: new Date().toISOString() }
        setNotes(prev => [...prev, newNote])
        setText('')
        toast.success('Note added')
      } else {
        toast.error('Failed to add note')
      }
    } catch { toast.error('Network error') }
    setSubmitting(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          Notes & Activity
          {notes.length > 0 && (
            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--green-100)', color: 'var(--green-700)', borderRadius: '999px', padding: '1px 8px' }}>
              {notes.length}
            </span>
          )}
        </h2>
      </div>

      {/* Notes list */}
      {notes.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {notes.map(note => (
            <div
              key={note.id}
              style={{
                display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                padding: '0.875rem 1rem',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                borderLeft: '3px solid var(--green-400)',
              }}
            >
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--green-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.7rem', flexShrink: 0 }}>
                A
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 0.375rem', whiteSpace: 'pre-wrap' }}>
                  {note.note_text}
                </p>
                <p style={{ fontSize: '0.7rem', color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(note.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '1.5rem', background: 'var(--bg-elevated)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-faint)' }}>No notes yet. Add one below.</p>
        </div>
      )}

      {/* Compose */}
      <div style={{ position: 'relative' }}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Add a note or internal comment… (⌘↵ to submit)"
          rows={3}
          className="input"
          style={{ resize: 'vertical', paddingBottom: '3rem', minHeight: '90px', fontFamily: 'var(--font)' }}
          onKeyDown={e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit() }
          }}
        />
        <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)' }}>⌘↵</span>
          <button
            onClick={submit}
            disabled={submitting || !text.trim()}
            className="btn-primary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.78rem', borderRadius: 'var(--radius-full)' }}
          >
            {submitting ? 'Adding…' : 'Add Note'}
          </button>
        </div>
      </div>
    </div>
  )
}
