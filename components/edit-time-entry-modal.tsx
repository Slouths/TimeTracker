'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

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

interface Client {
  id: string
  name: string
  hourly_rate: number
}

interface EditTimeEntryModalProps {
  entry: TimeEntry | null
  userId: string
  onClose: () => void
  onSaved: () => void
}

export function EditTimeEntryModal({
  entry,
  userId,
  onClose,
  onSaved,
}: EditTimeEntryModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Load clients
  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (data) {
        setClients(data)
      }
    }
    loadClients()
  }, [userId, supabase])

  // Populate form when entry changes
  useEffect(() => {
    if (entry) {
      const start = new Date(entry.start_time)
      const end = new Date(entry.end_time)

      setClientId(entry.client_id)
      setStartDate(start.toISOString().split('T')[0])
      setStartTime(start.toTimeString().substring(0, 5))
      setEndDate(end.toISOString().split('T')[0])
      setEndTime(end.toTimeString().substring(0, 5))
      setNotes(entry.notes || '')
    }
  }, [entry])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!entry) return

    setLoading(true)

    // Combine date and time
    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)

    // Calculate duration
    const durationMinutes = Math.floor(
      (endDateTime.getTime() - startDateTime.getTime()) / 1000 / 60
    )

    if (durationMinutes <= 0) {
      toast.error('End time must be after start time')
      setLoading(false)
      return
    }

    // Get client hourly rate
    const client = clients.find((c) => c.id === clientId)
    const amount = client ? (durationMinutes / 60) * client.hourly_rate : 0

    // Update time entry
    const { error } = await supabase
      .from('time_entries')
      .update({
        client_id: clientId,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        duration_minutes: durationMinutes,
        notes: notes || null,
        amount: amount,
      })
      .eq('id', entry.id)

    if (error) {
      console.error('Error updating time entry:', error)
      toast.error('Failed to update time entry', error.message)
    } else {
      toast.success('Time entry updated!')
      onSaved()
      onClose()
    }

    setLoading(false)
  }

  if (!entry) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-brand-charcoal">
            Edit Time Entry
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-brand-charcoal transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selector */}
          <div>
            <label
              htmlFor="client"
              className="block text-sm font-medium text-brand-charcoal mb-1"
            >
              Client *
            </label>
            <select
              id="client"
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - ${client.hourly_rate}/hr
                </option>
              ))}
            </select>
          </div>

          {/* Start Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm font-medium text-brand-charcoal mb-1"
              >
                Start Date *
              </label>
              <input
                id="start-date"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="start-time"
                className="block text-sm font-medium text-brand-charcoal mb-1"
              >
                Start Time *
              </label>
              <input
                id="start-time"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
          </div>

          {/* End Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm font-medium text-brand-charcoal mb-1"
              >
                End Date *
              </label>
              <input
                id="end-date"
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="end-time"
                className="block text-sm font-medium text-brand-charcoal mb-1"
              >
                End Time *
              </label>
              <input
                id="end-time"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-brand-charcoal mb-1"
            >
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you work on?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Entry'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
