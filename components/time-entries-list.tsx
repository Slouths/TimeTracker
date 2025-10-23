'use client'

import { useEffect, useState } from 'react'
import { Clock, Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface TimeEntry {
  id: string
  client_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  notes: string | null
  amount: number
  clients: {
    name: string
  }
}

interface TimeEntriesListProps {
  userId: string
  refreshTrigger?: number
  onEditEntry?: (entry: TimeEntry) => void
}

export function TimeEntriesList({
  userId,
  refreshTrigger = 0,
  onEditEntry,
}: TimeEntriesListProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadEntries() {
      setLoading(true)
      const { data } = await supabase
        .from('time_entries')
        .select(
          `
          *,
          clients (
            name
          )
        `
        )
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(10)

      if (data) {
        setEntries(data as TimeEntry[])
      }
      setLoading(false)
    }

    loadEntries()
  }, [userId, refreshTrigger, supabase])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handleDelete = async (entryId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete this time entry for ${clientName}? This cannot be undone.`)) {
      return
    }

    setDeletingId(entryId)

    const { error } = await supabase
      .from('time_entries')
      .delete()
      .eq('id', entryId)

    if (error) {
      console.error('Error deleting time entry:', error)
      alert('Failed to delete time entry')
    } else {
      // Remove from local state
      setEntries((prev) => prev.filter((e) => e.id !== entryId))
    }

    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-brand-charcoal mb-4">
          Recent Time Entries
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No time entries yet.</p>
          <p className="text-sm mt-1">Start tracking time to see entries here!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-brand-charcoal mb-4">
        Recent Time Entries
      </h3>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-ash-gray rounded-lg p-4 hover:bg-gray-100 transition-colors group"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-semibold text-brand-charcoal">
                  {entry.clients.name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(entry.start_time)}
                </p>
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-lg text-brand-green">
                  ${entry.amount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDuration(entry.duration_minutes)}
                </p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => onEditEntry?.(entry)}
                  className="p-2 text-gray-500 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                  title="Edit entry"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(entry.id, entry.clients.name)}
                  disabled={deletingId === entry.id}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete entry"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>
                {formatTime(entry.start_time)} → {formatTime(entry.end_time)}
              </span>
            </div>

            {entry.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">
                &quot;{entry.notes}&quot;
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
