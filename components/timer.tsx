'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Fragment } from 'react'
import { toast } from '@/lib/toast'

interface Client {
  id: string
  name: string
  hourly_rate: number
}

interface Project {
  id: string
  name: string
  client_id: string
  status: string
}

interface TimerProps {
  userId: string
  onTimeEntrySaved?: () => void
  refreshTrigger?: number
}

export function Timer({ userId, onTimeEntrySaved, refreshTrigger = 0 }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [clients, setClients] = useState<Client[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [pausedAt, setPausedAt] = useState<Date | null>(null)
  const [totalPausedTime, setTotalPausedTime] = useState(0)

  const supabase = createClient()

  // Filter clients based on search query
  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isDropdownOpen])

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
  }, [userId, refreshTrigger, supabase])

  // Load projects for selected client
  useEffect(() => {
    async function loadProjects() {
      if (!selectedClientId) {
        setProjects([])
        setSelectedProjectId('')
        return
      }

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .eq('client_id', selectedClientId)
        .eq('status', 'active')
        .order('name')

      if (data) {
        setProjects(data)
      } else {
        setProjects([])
      }
    }
    loadProjects()
  }, [selectedClientId, userId, supabase])

  // Timer tick
  useEffect(() => {
    if (!isRunning || !startTime || isPaused) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000) - totalPausedTime
      setElapsedSeconds(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime, isPaused, totalPausedTime])

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleStart = useCallback(() => {
    if (!selectedClientId) {
      toast.error('Please select a client first!')
      return
    }

    setStartTime(new Date())
    setElapsedSeconds(0)
    setIsRunning(true)
    setIsPaused(false)
    setTotalPausedTime(0)
  }, [selectedClientId])

  const handlePause = useCallback(() => {
    setIsPaused(true)
    setPausedAt(new Date())
  }, [])

  const handleResume = useCallback(() => {
    if (pausedAt) {
      const now = new Date()
      const pausedDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000)
      setTotalPausedTime((prev) => prev + pausedDuration)
    }
    setIsPaused(false)
    setPausedAt(null)
  }, [pausedAt])

  const handleStop = useCallback(async () => {
    if (!startTime || !selectedClientId) return

    setLoading(true)
    const endTime = new Date()

    // Calculate duration excluding paused time
    const totalElapsedSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000)
    const activeSeconds = totalElapsedSeconds - totalPausedTime
    const durationMinutes = Math.floor(activeSeconds / 60)

    // Get client hourly rate
    const client = clients.find((c) => c.id === selectedClientId)
    const amount = client
      ? (durationMinutes / 60) * client.hourly_rate
      : 0

    // Save time entry
    const { error } = await supabase.from('time_entries').insert({
      user_id: userId,
      client_id: selectedClientId,
      project_id: selectedProjectId || null,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      notes: notes || null,
      amount: amount,
    })

    if (error) {
      console.error('Error saving time entry:', error)
      toast.error('Failed to save time entry', error.message)
    } else {
      // Reset state
      setIsRunning(false)
      setStartTime(null)
      setElapsedSeconds(0)
      setNotes('')
      setSelectedClientId('')
      setSelectedProjectId('')
      setIsPaused(false)
      setPausedAt(null)
      setTotalPausedTime(0)

      toast.success('Time entry saved!', `${formatTime(durationMinutes * 60)} tracked`)

      // Notify parent component
      if (onTimeEntrySaved) {
        onTimeEntrySaved()
      }
    }

    setLoading(false)
  }, [startTime, selectedClientId, clients, supabase, userId, notes, onTimeEntrySaved, totalPausedTime, formatTime])

  // Keyboard shortcuts (must be after handleStart and handleStop definitions)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      // Space: Start/Stop timer
      if (e.code === 'Space') {
        e.preventDefault()
        if (isRunning && !isPaused) {
          handleStop()
        } else if (!isRunning && selectedClientId && clients.length > 0) {
          handleStart()
        }
      }

      // P: Pause/Resume timer
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        if (isRunning) {
          if (isPaused) {
            handleResume()
          } else {
            handlePause()
          }
        }
      }

      // Cmd+K (Mac) or Ctrl+K (Windows): Open client dropdown
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (!isRunning) {
          setIsDropdownOpen(true)
        }
      }

      // Escape: Close dropdown
      if (e.key === 'Escape') {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, isPaused, selectedClientId, clients.length, handleStart, handleStop, handlePause, handleResume])

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const estimatedEarnings = selectedClient
    ? (elapsedSeconds / 3600) * selectedClient.hourly_rate
    : 0

  return (
    <div className="bg-white border border-slate-200 rounded-md shadow-md p-8">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-950 uppercase tracking-wide">Time Tracker</h2>
      </div>

      {/* Timer Display */}
      <div className={`bg-slate-50 rounded p-8 mb-6 text-center border border-slate-200 relative`}>
        <div className={`text-6xl md:text-6xl text-4xl font-bold font-mono tracking-tight ${isRunning && !isPaused ? 'text-slate-950' : 'text-slate-400'}`}>
          {formatTime(elapsedSeconds)}
        </div>
        {isPaused && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded uppercase tracking-wide">
              Paused
            </span>
          </div>
        )}
      </div>

      {/* Client Selector */}
      <div className="mb-4 relative" data-dropdown>
        {clients.length === 0 ? (
          <div className="bg-slate-100 border border-slate-200 rounded p-3 text-center">
            <p className="text-sm text-slate-600">No clients yet - Add one below</p>
          </div>
        ) : (
          <>
            {/* Custom Dropdown Button */}
            <button
              type="button"
              onClick={() => !isRunning && setIsDropdownOpen(!isDropdownOpen)}
              disabled={isRunning}
              className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed text-sm flex items-center justify-between transition-colors hover:border-slate-300"
            >
              <div className="flex items-center gap-2">
                {selectedClientId ? (
                  <span className="font-medium text-slate-900 text-sm flex items-center gap-4">
                    {clients.find((c) => c.id === selectedClientId)?.name}
                    <span className="text-slate-500 text-xs font-mono">
                      ${clients.find((c) => c.id === selectedClientId)?.hourly_rate}/hr
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-500 text-sm">Choose a client...</span>
                )}
              </div>
              <span className={`text-slate-400 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}>
                ▾
              </span>
            </button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && !isRunning && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded shadow-md overflow-hidden">
                {/* Search Input */}
                {clients.length > 3 && (
                  <div className="p-2 border-b border-slate-200">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search clients..."
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      autoFocus
                    />
                  </div>
                )}
                <div className="max-h-56 overflow-y-auto">
                  {filteredClients.length === 0 ? (
                    <div className="px-3 py-4 text-center text-sm text-slate-500">
                      No clients match &quot;{searchQuery}&quot;
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setSelectedClientId(client.id)
                        setIsDropdownOpen(false)
                        setSearchQuery('')
                      }}
                      className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="text-left">
                          <div className="font-medium text-slate-900 text-sm">
                            {client.name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono">
                            ${client.hourly_rate}/hr
                          </div>
                        </div>
                      </div>
                      {selectedClientId === client.id && (
                        <span className="text-accent-primary text-sm">✓</span>
                      )}
                    </button>
                  )))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Selector (shows when client selected) */}
      {selectedClientId && !isRunning && (
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-600 mb-1 uppercase tracking-wide">
            Project (Optional)
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          {projects.length === 0 && (
            <p className="text-xs text-slate-500 mt-1">No active projects for this client</p>
          )}
        </div>
      )}

      {/* Running Info & Notes */}
      {isRunning && selectedClient && (
        <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-slate-900">
              {selectedClient.name}
              {selectedProjectId && projects.find(p => p.id === selectedProjectId) && (
                <span className="text-slate-600 text-xs ml-2">
                  • {projects.find(p => p.id === selectedProjectId)?.name}
                </span>
              )}
            </span>
            <span className="text-slate-950 font-bold font-mono">~${estimatedEarnings.toFixed(2)}</span>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)..."
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary text-sm"
          />
        </div>
      )}

      {/* Action Buttons */}
      {!isRunning ? (
        <Button
          onClick={handleStart}
          disabled={clients.length === 0 || !selectedClientId}
          className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3.5 rounded font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm uppercase tracking-wide"
        >
          Start Timer
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            {!isPaused ? (
              <Button
                onClick={handlePause}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-3.5 rounded font-medium transition-colors text-sm uppercase tracking-wide"
              >
                Pause
              </Button>
            ) : (
              <Button
                onClick={handleResume}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3.5 rounded font-medium transition-colors text-sm uppercase tracking-wide"
              >
                Resume
              </Button>
            )}
            <Button
              onClick={handleStop}
              disabled={loading}
              className="flex-1 bg-error hover:bg-error/90 text-white py-3.5 rounded font-medium transition-colors text-sm uppercase tracking-wide"
            >
              {loading ? 'Saving...' : 'Stop & Save'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
