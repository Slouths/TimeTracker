'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast, confirm } from '@/lib/toast'
import { AddTimeEntryModal } from './add-time-entry-modal'

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

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
    confirm(
      `Delete time entry for ${clientName}? This cannot be undone.`,
      async () => {
        setDeletingId(entryId)

        const { error } = await supabase
          .from('time_entries')
          .delete()
          .eq('id', entryId)

        if (error) {
          console.error('Error deleting time entry:', error)
          toast.error('Failed to delete time entry', error.message)
        } else {
          // Remove from local state
          setEntries((prev) => prev.filter((e) => e.id !== entryId))
          toast.success('Time entry deleted', `Entry for ${clientName} has been removed`)
        }

        setDeletingId(null)
      }
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-slate-100 rounded"></div>
            <div className="h-16 bg-slate-100 rounded"></div>
            <div className="h-16 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-4">
          Recent Time Entries
        </h3>
        <div className="text-center py-12 px-4">
          <p className="text-sm text-slate-600">No time entries yet</p>
          <p className="text-xs text-slate-500 mt-2">
            Start the timer above to track your first session
          </p>
        </div>
      </div>
    )
  }

  const handleRefresh = () => {
    // Trigger a reload by updating refreshTrigger in parent
    const loadEntries = async () => {
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
    }
    loadEntries()
  }

  return (
    <>
      <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide">
            Recent Time Entries
          </h3>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white px-3 py-1.5 rounded font-medium transition-colors text-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Entry
          </Button>
        </div>

        <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="bg-slate-50 rounded border border-slate-200 p-3 hover:bg-slate-100 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-semibold text-slate-950 text-sm">
                  {entry.clients.name}
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  {formatDate(entry.start_time)}
                </p>
              </div>
              <div className="text-right flex-1">
                <p className="font-bold text-lg text-slate-950 font-mono">
                  ${entry.amount.toFixed(2)}
                </p>
                <p className="text-xs text-slate-600">
                  {formatDuration(entry.duration_minutes)}
                </p>
              </div>
              <div className="flex gap-1 ml-4">
                <button
                  onClick={() => onEditEntry?.(entry)}
                  className="p-1.5 text-slate-500 hover:text-accent-primary hover:bg-accent-primary/10 rounded transition-colors"
                  title="Edit entry"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(entry.id, entry.clients.name)}
                  disabled={deletingId === entry.id}
                  className="p-1.5 text-slate-500 hover:text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                  title="Delete entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-600">
              <span>
                {formatTime(entry.start_time)} → {formatTime(entry.end_time)}
              </span>
            </div>

            {entry.notes && (
              <p className="text-xs text-slate-600 mt-2 italic">
                &quot;{entry.notes}&quot;
              </p>
            )}
          </div>
        ))}
        </div>

        {/* View All Link */}
        <div className="mt-4 text-center">
          <a
            href="/time-entries"
            className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium"
          >
            View All Entries →
          </a>
        </div>
      </div>

      <AddTimeEntryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userId={userId}
        onSaved={handleRefresh}
      />
    </>
  )
}
