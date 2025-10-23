'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Clock, Play, Square, ChevronDown, Check, User, HelpCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Popover, Transition } from '@headlessui/react'
import { Fragment } from 'react'

interface Client {
  id: string
  name: string
  hourly_rate: number
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
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const supabase = createClient()

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

  // Timer tick
  useEffect(() => {
    if (!isRunning || !startTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000)
      setElapsedSeconds(elapsed)
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, startTime])

  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }, [])

  const handleStart = () => {
    if (!selectedClientId) {
      alert('Please select a client first!')
      return
    }

    setStartTime(new Date())
    setElapsedSeconds(0)
    setIsRunning(true)
  }

  const handleStop = async () => {
    if (!startTime || !selectedClientId) return

    setLoading(true)
    const endTime = new Date()
    const durationMinutes = Math.floor(
      (endTime.getTime() - startTime.getTime()) / 1000 / 60
    )

    // Get client hourly rate
    const client = clients.find((c) => c.id === selectedClientId)
    const amount = client
      ? (durationMinutes / 60) * client.hourly_rate
      : 0

    // Save time entry
    const { error } = await supabase.from('time_entries').insert({
      user_id: userId,
      client_id: selectedClientId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      notes: notes || null,
      amount: amount,
    })

    if (error) {
      console.error('Error saving time entry:', error)
      alert('Failed to save time entry')
    } else {
      // Reset state
      setIsRunning(false)
      setStartTime(null)
      setElapsedSeconds(0)
      setNotes('')
      setSelectedClientId('')

      // Notify parent component
      if (onTimeEntrySaved) {
        onTimeEntrySaved()
      }
    }

    setLoading(false)
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId)
  const estimatedEarnings = selectedClient
    ? (elapsedSeconds / 3600) * selectedClient.hourly_rate
    : 0

  return (
    <div className="relative bg-gradient-to-br from-white via-white to-brand-green/5 rounded-2xl shadow-xl p-8 border border-brand-green/10">
      {/* Subtle accent background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-green/5 rounded-full blur-3xl -z-10 overflow-hidden" />

      {/* Header Row */}
      <div className="flex items-center gap-3 mb-6">
        <Clock className="h-8 w-8 text-brand-green flex-shrink-0" />
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-brand-charcoal">Time Tracker</h2>
          <p className="text-sm text-gray-500">Track your billable hours</p>
        </div>
        {/* Timer Display inline */}
        <div className={`text-5xl font-bold font-mono tracking-tight ${isRunning ? 'text-brand-green' : 'text-gray-400'}`}>
          {formatTime(elapsedSeconds)}
        </div>
      </div>

      {/* Client Selector */}
      <div className="mb-4 relative" data-dropdown>
        {clients.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
            <p className="text-sm text-amber-800">No clients yet - Add one below</p>
          </div>
        ) : (
          <>
            {/* Custom Dropdown Button */}
            <button
              type="button"
              onClick={() => !isRunning && setIsDropdownOpen(!isDropdownOpen)}
              disabled={isRunning}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed text-sm flex items-center justify-between transition-all hover:border-brand-green/50"
            >
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-gray-400" />
                {selectedClientId ? (
                  <span className="font-medium text-brand-charcoal text-sm flex items-center gap-4">
                    {clients.find((c) => c.id === selectedClientId)?.name}
                    <span className="text-gray-500 text-xs">
                      ${clients.find((c) => c.id === selectedClientId)?.hourly_rate}/hr
                    </span>
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">Choose a client...</span>
                )}
              </div>
              <ChevronDown
                className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Custom Dropdown Menu */}
            {isDropdownOpen && !isRunning && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-56 overflow-y-auto">
                  {clients.map((client) => (
                    <button
                      key={client.id}
                      type="button"
                      onClick={() => {
                        setSelectedClientId(client.id)
                        setIsDropdownOpen(false)
                      }}
                      className="w-full px-3 py-2 flex items-center justify-between hover:bg-brand-green/5 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand-green/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-3 w-3 text-brand-green" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-brand-charcoal text-sm">
                            {client.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${client.hourly_rate}/hr
                          </div>
                        </div>
                      </div>
                      {selectedClientId === client.id && (
                        <Check className="h-4 w-4 text-brand-green flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Running Info & Notes */}
      {isRunning && selectedClient && (
        <div className="mb-4 p-3 bg-brand-green/10 rounded-lg border border-brand-green/20">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-brand-charcoal">{selectedClient.name}</span>
            <span className="text-brand-green font-bold">~${estimatedEarnings.toFixed(2)}</span>
          </div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes (optional)..."
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green text-sm"
          />
        </div>
      )}

      {/* Action Button */}
      {!isRunning ? (
        <Button
          onClick={handleStart}
          disabled={clients.length === 0 || !selectedClientId}
          className="w-full bg-brand-green hover:bg-brand-green/90 text-white py-3 rounded-lg disabled:opacity-50"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Timer
        </Button>
      ) : (
        <Button
          onClick={handleStop}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg"
        >
          <Square className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Stop & Save'}
        </Button>
      )}
    </div>
  )
}
