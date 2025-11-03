'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Pencil, Trash2, Download, ChevronLeft, ChevronRight, Edit3, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast, confirm } from '@/lib/toast'
import { formatDuration } from '@/lib/time-utils'
import { BulkDeleteConfirm } from './bulk-delete-confirm'
import { BulkEditModal } from './bulk-edit-modal'

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

interface Client {
  id: string
  name: string
}

interface TimeEntriesTableProps {
  userId: string
  onEditEntry?: (entry: TimeEntry) => void
}

export function TimeEntriesTable({ userId, onEditEntry }: TimeEntriesTableProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Filters
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [searchNotes, setSearchNotes] = useState<string>('')
  const [minAmount, setMinAmount] = useState<string>('')
  const [maxAmount, setMaxAmount] = useState<string>('')

  // Sorting
  const [sortBy, setSortBy] = useState<'date' | 'client' | 'duration' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const entriesPerPage = 20

  // Selection
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())

  // Bulk operations
  const [showBulkDelete, setShowBulkDelete] = useState(false)
  const [showBulkEdit, setShowBulkEdit] = useState(false)

  const supabase = createClient()

  // Load clients
  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', userId)
        .order('name')

      if (data) {
        setClients(data)
      }
    }
    loadClients()
  }, [userId, supabase])

  // Load entries
  useEffect(() => {
    async function loadEntries() {
      setLoading(true)
      const { data } = await supabase
        .from('time_entries')
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (data) {
        setEntries(data as TimeEntry[])
      }
      setLoading(false)
    }

    loadEntries()
  }, [userId, supabase])

  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let filtered = [...entries]

    // Filter by client
    if (selectedClientId) {
      filtered = filtered.filter(e => e.client_id === selectedClientId)
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(e => new Date(e.start_time) >= new Date(startDate))
    }
    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      filtered = filtered.filter(e => new Date(e.start_time) <= endDateTime)
    }

    // Filter by notes
    if (searchNotes) {
      filtered = filtered.filter(e =>
        e.notes?.toLowerCase().includes(searchNotes.toLowerCase())
      )
    }

    // Filter by amount range
    if (minAmount) {
      filtered = filtered.filter(e => e.amount >= parseFloat(minAmount))
    }
    if (maxAmount) {
      filtered = filtered.filter(e => e.amount <= parseFloat(maxAmount))
    }

    // Sort entries
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'date':
          comparison = new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
          break
        case 'client':
          comparison = a.clients.name.localeCompare(b.clients.name)
          break
        case 'duration':
          comparison = a.duration_minutes - b.duration_minutes
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [entries, selectedClientId, startDate, endDate, searchNotes, minAmount, maxAmount, sortBy, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEntries.length / entriesPerPage)
  const paginatedEntries = filteredAndSortedEntries.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  )

  // Summary calculations
  const summary = useMemo(() => {
    const totalMinutes = filteredAndSortedEntries.reduce((sum, e) => sum + e.duration_minutes, 0)
    const totalEarnings = filteredAndSortedEntries.reduce((sum, e) => sum + e.amount, 0)
    const avgRate = totalMinutes > 0 ? (totalEarnings / totalMinutes) * 60 : 0

    return {
      totalHours: (totalMinutes / 60).toFixed(2),
      totalEarnings: totalEarnings.toFixed(2),
      avgRate: avgRate.toFixed(2),
      entryCount: filteredAndSortedEntries.length
    }
  }, [filteredAndSortedEntries])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
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
          toast.error('Failed to delete time entry', error.message)
        } else {
          setEntries(prev => prev.filter(e => e.id !== entryId))
          toast.success('Time entry deleted', `Entry for ${clientName} has been removed`)
        }

        setDeletingId(null)
      }
    )
  }

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const toggleSelection = (entryId: string) => {
    const newSelection = new Set(selectedEntries)
    if (newSelection.has(entryId)) {
      newSelection.delete(entryId)
    } else {
      newSelection.add(entryId)
    }
    setSelectedEntries(newSelection)
  }

  const toggleSelectAll = () => {
    if (selectedEntries.size === paginatedEntries.length) {
      setSelectedEntries(new Set())
    } else {
      setSelectedEntries(new Set(paginatedEntries.map(e => e.id)))
    }
  }

  const exportToCSV = () => {
    const entriesToExport = selectedEntries.size > 0
      ? filteredAndSortedEntries.filter(e => selectedEntries.has(e.id))
      : filteredAndSortedEntries

    const headers = ['Date', 'Client', 'Start Time', 'End Time', 'Duration', 'Amount', 'Notes']
    const rows = entriesToExport.map(entry => [
      formatDate(entry.start_time),
      entry.clients.name,
      formatTime(entry.start_time),
      formatTime(entry.end_time),
      formatDuration(entry.duration_minutes),
      `$${entry.amount.toFixed(2)}`,
      entry.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-entries-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('CSV exported!', `Exported ${entriesToExport.length} entries`)
  }

  const clearFilters = () => {
    setSelectedClientId('')
    setStartDate('')
    setEndDate('')
    setSearchNotes('')
    setMinAmount('')
    setMaxAmount('')
    setCurrentPage(1)
  }

  const handleBulkDelete = async () => {
    const idsToDelete = Array.from(selectedEntries)

    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .in('id', idsToDelete)

      if (error) throw error

      setEntries(prev => prev.filter(e => !selectedEntries.has(e.id)))
      setSelectedEntries(new Set())
      toast.success('Entries deleted', `Deleted ${idsToDelete.length} entries`)
    } catch (error) {
      console.error('Error deleting entries:', error)
      toast.error('Failed to delete entries', 'Please try again')
    } finally {
      setShowBulkDelete(false)
    }
  }

  const handleBulkEditSaved = () => {
    setShowBulkEdit(false)
    setSelectedEntries(new Set())
    // Reload entries
    const loadEntries = async () => {
      const { data } = await supabase
        .from('time_entries')
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false })

      if (data) {
        setEntries(data as TimeEntry[])
      }
    }
    loadEntries()
  }

  const exportSelectedToCSV = () => {
    const selectedIds = Array.from(selectedEntries)
    const entriesToExport = filteredAndSortedEntries.filter(e => selectedIds.includes(e.id))

    if (entriesToExport.length === 0) {
      toast.warning('No entries selected')
      return
    }

    const headers = ['Date', 'Client', 'Start Time', 'End Time', 'Duration', 'Amount', 'Notes']
    const rows = entriesToExport.map(entry => [
      formatDate(entry.start_time),
      entry.clients.name,
      formatTime(entry.start_time),
      formatTime(entry.end_time),
      formatDuration(entry.duration_minutes),
      `$${entry.amount.toFixed(2)}`,
      entry.notes || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `time-entries-selected-${entriesToExport.length}.csv`
    a.click()
    window.URL.revokeObjectURL(url)

    toast.success('CSV exported!', `Exported ${entriesToExport.length} entries`)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Bulk Actions Toolbar */}
      {selectedEntries.size > 0 && (
        <div className="sticky top-0 z-10 bg-accent-primary text-white px-6 py-4 border-b border-accent-primary/20">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="font-semibold">
                {selectedEntries.size} {selectedEntries.size === 1 ? 'entry' : 'entries'} selected
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setShowBulkEdit(true)}
                className="bg-white text-accent-primary hover:bg-gray-100 px-4 py-2 rounded-md text-sm flex items-center gap-2"
              >
                <Edit3 className="h-4 w-4" />
                Bulk Edit
              </Button>
              <Button
                onClick={() => setShowBulkDelete(true)}
                className="bg-error hover:bg-error/90 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Bulk Delete
              </Button>
              <Button
                onClick={exportSelectedToCSV}
                className="bg-white text-accent-primary hover:bg-gray-100 px-4 py-2 rounded-md text-sm flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export Selected
              </Button>
              <Button
                onClick={() => setSelectedEntries(new Set())}
                className="bg-transparent border border-white hover:bg-white/10 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-brand-charcoal">Filter & Search</h2>
          <Button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-accent-primary"
          >
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Client Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => {
                setSelectedClientId(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          {/* Search Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Notes
            </label>
            <input
              type="text"
              value={searchNotes}
              onChange={(e) => {
                setSearchNotes(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search in notes..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          {/* Min Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Min Amount
            </label>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => {
                setMinAmount(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Amount
            </label>
            <input
              type="number"
              value={maxAmount}
              onChange={(e) => {
                setMaxAmount(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Showing {paginatedEntries.length} of {filteredAndSortedEntries.length} entries
          {selectedEntries.size > 0 && (
            <span className="ml-2 font-medium text-accent-primary">
              ({selectedEntries.size} selected)
            </span>
          )}
        </div>
        <Button
          onClick={exportToCSV}
          className="bg-accent-primary hover:bg-accent-primary/90 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEntries.size === paginatedEntries.length && paginatedEntries.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('date')}
              >
                Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('client')}
              >
                Client {sortBy === 'client' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Time
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('duration')}
              >
                Duration {sortBy === 'duration' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => toggleSort('amount')}
              >
                Amount {sortBy === 'amount' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedEntries.has(entry.id)}
                    onChange={() => toggleSelection(entry.id)}
                    className="rounded"
                  />
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDate(entry.start_time)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {entry.clients.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {formatTime(entry.start_time)} → {formatTime(entry.end_time)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {formatDuration(entry.duration_minutes)}
                </td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  ${entry.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                  {entry.notes || '-'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEditEntry?.(entry)}
                      className="p-1 text-gray-500 hover:text-accent-primary"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id, entry.clients.name)}
                      disabled={deletingId === entry.id}
                      className="p-1 text-gray-500 hover:text-error disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile */}
      <div className="md:hidden divide-y divide-gray-200">
        {paginatedEntries.map((entry) => (
          <div key={entry.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{entry.clients.name}</p>
                <p className="text-sm text-gray-600">{formatDate(entry.start_time)}</p>
              </div>
              <p className="font-bold text-gray-900">${entry.amount.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{formatTime(entry.start_time)} → {formatTime(entry.end_time)}</span>
              <span>{formatDuration(entry.duration_minutes)}</span>
            </div>
            {entry.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">&quot;{entry.notes}&quot;</p>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEditEntry?.(entry)}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(entry.id, entry.clients.name)}
                className="flex-1 px-3 py-1.5 text-sm border border-error text-error rounded hover:bg-error/10"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase">Total Entries</p>
            <p className="text-lg font-bold text-gray-900">{summary.entryCount}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase">Total Hours</p>
            <p className="text-lg font-bold text-gray-900">{summary.totalHours}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase">Total Earnings</p>
            <p className="text-lg font-bold text-gray-900">${summary.totalEarnings}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase">Avg Hourly Rate</p>
            <p className="text-lg font-bold text-gray-900">${summary.avgRate}</p>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <Button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>

          <Button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 rounded disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {showBulkDelete && (
        <BulkDeleteConfirm
          count={selectedEntries.size}
          onConfirm={handleBulkDelete}
          onCancel={() => setShowBulkDelete(false)}
        />
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <BulkEditModal
          selectedIds={Array.from(selectedEntries)}
          userId={userId}
          onClose={() => setShowBulkEdit(false)}
          onSaved={handleBulkEditSaved}
        />
      )}
    </div>
  )
}
