'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { TimeEntriesTable } from '@/components/time-entries/time-entries-table'
import { EditTimeEntryModal } from '@/components/edit-time-entry-modal'
import type { User } from '@supabase/supabase-js'

interface TimeEntry {
  id: string
  client_id: string
  project_id: string | null
  start_time: string
  end_time: string
  duration_minutes: number
  notes: string | null
  amount: number
  clients: {
    name: string
  }
}

export default function TimeEntriesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)
      setLoading(false)
    }

    loadUser()
  }, [supabase, router])

  const handleEditSaved = () => {
    setEditingEntry(null)
    setRefreshTrigger(prev => prev + 1)
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-96 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">
            All Time Entries
          </h1>
          <p className="text-gray-600">
            View, filter, and manage all your tracked time
          </p>
        </div>

        <TimeEntriesTable
          userId={user.id}
          onEditEntry={setEditingEntry}
        />
      </main>

      {editingEntry && (
        <EditTimeEntryModal
          entry={editingEntry}
          onClose={() => setEditingEntry(null)}
          onSaved={handleEditSaved}
        />
      )}
    </div>
  )
}
