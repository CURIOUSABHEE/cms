'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

type Note = { id: string; note_text: string; created_at: string }

export default function NotesSection({ ticketId, notes: initialNotes }: { ticketId: string; notes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  async function addNote() {
    if (!text.trim()) return
    setSending(true)
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_text: text }),
    })
    if (res.ok) {
      const newNote: Note = { id: crypto.randomUUID(), note_text: text, created_at: new Date().toISOString() }
      setNotes([...notes, newNote])
      setText('')
      toast.success('Note added')
    } else {
      toast.error('Failed to add note')
    }
    setSending(false)
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Notes</h3>
      <div className="space-y-3 mb-4">
        {notes.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">No notes yet.</p>}
        {notes.map((note) => (
          <div key={note.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-800 dark:text-gray-200">{note.note_text}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(note.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <textarea
          className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          rows={2}
          placeholder="Add a note..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={addNote}
          disabled={sending || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 self-end"
        >
          {sending ? '...' : 'Add'}
        </button>
      </div>
    </div>
  )
}
