'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/toast'

interface Client {
  id: string
  name: string
  hourly_rate: number
}

interface Project {
  id: string
  name: string
}

interface AddTimeEntryModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  onSaved: () => void
}

export function AddTimeEntryModal({
  isOpen,
  onClose,
  userId,
  onSaved,
}: AddTimeEntryModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')
  const [durationHours, setDurationHours] = useState('')
  const [durationMinutes, setDurationMinutes] = useState('')
  const [notes, setNotes] = useState('')
  const [useEndTime, setUseEndTime] = useState(true)
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Load clients
  useEffect(() => {
    if (isOpen) {
      async function loadClients() {
        const { data } = await supabase
          .from('clients')
          .select('id, name, hourly_rate')
          .eq('user_id', userId)
          .order('name')

        if (data) {
          setClients(data)
        }
      }
      loadClients()
    }
  }, [isOpen, userId, supabase])

  // Load projects when client changes
  useEffect(() => {
    if (selectedClientId) {
      async function loadProjects() {
        const { data } = await supabase
          .from('projects')
          .select('id, name')
          .eq('client_id', selectedClientId)
          .eq('status', 'active')
          .order('name')

        if (data) {
          setProjects(data)
        }
      }
      loadProjects()
    } else {
      setProjects([])
      setSelectedProjectId('')
    }
  }, [selectedClientId, supabase])

  // Calculate duration from start/end times
  const calculateDuration = () => {
    if (!startTime || !endTime) return 0

    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    return Math.max(0, endMinutes - startMinutes)
  }

  // Get duration in minutes
  const getDurationMinutes = () => {
    if (useEndTime) {
      return calculateDuration()
    } else {
      const hours = parseInt(durationHours) || 0
      const minutes = parseInt(durationMinutes) || 0
      return hours * 60 + minutes
    }
  }

  // Calculate amount
  const calculateAmount = () => {
    const client = clients.find((c) => c.id === selectedClientId)
    if (!client) return 0

    const durationMin = getDurationMinutes()
    return (durationMin / 60) * client.hourly_rate
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedClientId) {
      toast.error('Please select a client')
      return
    }

    if (!date) {
      toast.error('Please select a date')
      return
    }

    const durationMin = getDurationMinutes()

    if (durationMin <= 0) {
      toast.error('Duration must be greater than 0')
      return
    }

    if (useEndTime && startTime >= endTime) {
      toast.error('End time must be after start time')
      return
    }

    setLoading(true)

    // Create start and end datetime objects
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    const startDateTime = new Date(date)
    startDateTime.setHours(startHour, startMin, 0, 0)

    const endDateTime = new Date(date)
    endDateTime.setHours(endHour, endMin, 0, 0)

    const amount = calculateAmount()

    const { error } = await supabase.from('time_entries').insert({
      user_id: userId,
      client_id: selectedClientId,
      project_id: selectedProjectId || null,
      start_time: startDateTime.toISOString(),
      end_time: endDateTime.toISOString(),
      duration_minutes: durationMin,
      notes: notes || null,
      amount: amount,
    })

    if (error) {
      console.error('Error creating time entry:', error)
      toast.error('Failed to create time entry', error.message)
    } else {
      toast.success('Time entry created!', `${Math.floor(durationMin / 60)}h ${durationMin % 60}m tracked`)
      onSaved()
      handleClose()
    }

    setLoading(false)
  }

  const handleClose = () => {
    setSelectedClientId('')
    setSelectedProjectId('')
    setProjects([])
    setDate(new Date().toISOString().split('T')[0])
    setStartTime('09:00')
    setEndTime('17:00')
    setDurationHours('')
    setDurationMinutes('')
    setNotes('')
    setUseEndTime(true)
    onClose()
  }

  if (!isOpen) return null

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const amount = calculateAmount()
  const durationMin = getDurationMinutes()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-950">Add Time Entry</h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Client Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Client *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
              required
            >
              <option value="">Choose a client...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} - ${client.hourly_rate}/hr
                </option>
              ))}
            </select>
          </div>

          {/* Project Selection (Optional) */}
          {selectedClientId && projects.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Project (optional)
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
              >
                <option value="">No specific project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
              required
            />
          </div>

          {/* Duration Input Toggle */}
          <div className="mb-4">
            <div className="flex gap-4">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={useEndTime}
                  onChange={() => setUseEndTime(true)}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700">Use Start/End Time</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  checked={!useEndTime}
                  onChange={() => setUseEndTime(false)}
                  className="mr-2"
                />
                <span className="text-sm text-slate-700">Use Duration</span>
              </label>
            </div>
          </div>

          {useEndTime ? (
            <>
              {/* Start Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
                  required
                />
              </div>

              {/* End Time */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
                  required
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Duration *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="number"
                    value={durationHours}
                    onChange={(e) => setDurationHours(e.target.value)}
                    placeholder="Hours"
                    min="0"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="Minutes"
                    min="0"
                    max="59"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this work..."
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm resize-none"
            />
          </div>

          {/* Preview */}
          {selectedClient && durationMin > 0 && (
            <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">
                  Duration: {Math.floor(durationMin / 60)}h {durationMin % 60}m
                </span>
                <span className="text-slate-950 font-bold font-mono">
                  ${amount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded font-medium transition-colors text-sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !selectedClientId || durationMin <= 0}
              className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-white py-2.5 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Creating...' : 'Create Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
