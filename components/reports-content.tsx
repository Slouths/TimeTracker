'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FileText, Download, FileSpreadsheet, Save, Filter } from 'lucide-react'
import { GenerateInvoice } from './generate-invoice'
import { Button } from './ui/button'
import { GoalProgress } from './goal-progress'
import { TimeHeatmap } from './time-heatmap'
import { generateTimeEntriesCSV, downloadCSV } from '@/lib/export-utils'
import { generatePDFReport, formatDateForPDF } from '@/lib/pdf-utils'
import { toast } from '@/lib/toast'
import { SaveFilterModal } from './reports/save-filter-modal'
import { getSavedFilters, deleteReportFilter, type ReportFilter } from '@/lib/report-filters'

interface TimeEntry {
  id: string
  client_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  amount: number
  notes: string | null
  clients: {
    name: string
  }
}

interface ClientStats {
  clientId: string
  clientName: string
  totalHours: number
  totalEarnings: number
  entryCount: number
  activityStatus?: 'active' | 'inactive' | 'dormant'
  lastEntryDate?: string
  daysSinceLastEntry?: number
}

interface ProjectStats {
  projectId: string
  projectName: string
  clientName: string
  totalHours: number
  totalEarnings: number
  budget: number | null
  percentUsed: number
  status: 'active' | 'completed' | 'archived'
}

interface ReportsContentProps {
  userId: string
}

type TimePeriod = 'week' | 'month' | 'year' | 'all'

export function ReportsContent({ userId }: ReportsContentProps) {
  const [entries, setEntries] = useState<TimeEntry[]>([])
  const [previousEntries, setPreviousEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false)

  // New state for enhanced reporting
  const [projects, setProjects] = useState<any[]>([])
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [clients, setClients] = useState<any[]>([])

  // Saved filters state
  const [savedFilters, setSavedFilters] = useState<ReportFilter[]>([])
  const [showSaveFilterModal, setShowSaveFilterModal] = useState(false)
  const [showSavedFiltersDropdown, setShowSavedFiltersDropdown] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, timePeriod, startDate, endDate, selectedClientIds])

  // Load clients, projects, and saved filters
  useEffect(() => {
    async function loadClientsAndProjects() {
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', userId)
        .order('name')

      if (clientsData) {
        setClients(clientsData)
      }

      const { data: projectsData } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            name
          )
        `)
        .eq('user_id', userId)
        .order('name')

      if (projectsData) {
        setProjects(projectsData)
      }

      // Load saved filters
      const filters = await getSavedFilters(userId)
      setSavedFilters(filters)
    }
    loadClientsAndProjects()
  }, [userId, supabase])

  const loadEntries = async () => {
    setLoading(true)

    let query = supabase
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

    // Apply date filters based on time period
    const now = new Date()
    let filterStartDate: Date | null = null
    let previousFilterStartDate: Date | null = null
    let previousFilterEndDate: Date | null = null

    if (timePeriod === 'week') {
      filterStartDate = new Date(now)
      filterStartDate.setDate(now.getDate() - 7)
      previousFilterEndDate = new Date(filterStartDate)
      previousFilterStartDate = new Date(filterStartDate)
      previousFilterStartDate.setDate(filterStartDate.getDate() - 7)
    } else if (timePeriod === 'month') {
      filterStartDate = new Date(now)
      filterStartDate.setDate(now.getDate() - 30)
      previousFilterEndDate = new Date(filterStartDate)
      previousFilterStartDate = new Date(filterStartDate)
      previousFilterStartDate.setDate(filterStartDate.getDate() - 30)
    } else if (timePeriod === 'year') {
      filterStartDate = new Date(now)
      filterStartDate.setFullYear(now.getFullYear() - 1)
      previousFilterEndDate = new Date(filterStartDate)
      previousFilterStartDate = new Date(filterStartDate)
      previousFilterStartDate.setFullYear(filterStartDate.getFullYear() - 1)
    }

    // Custom date range takes precedence
    if (startDate) {
      query = query.gte('start_time', new Date(startDate).toISOString())
    } else if (filterStartDate) {
      query = query.gte('start_time', filterStartDate.toISOString())
    }

    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      query = query.lte('start_time', endDateTime.toISOString())
    }

    // Multi-client filter
    if (selectedClientIds.length > 0) {
      query = query.in('client_id', selectedClientIds)
    }

    const { data } = await query

    if (data) {
      setEntries(data as TimeEntry[])
    }

    // Load previous period data for comparison (only for standard periods, not custom dates)
    if (!startDate && previousFilterStartDate && previousFilterEndDate) {
      const { data: previousData } = await supabase
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
        .gte('start_time', previousFilterStartDate.toISOString())
        .lte('start_time', previousFilterEndDate.toISOString())

      if (previousData) {
        setPreviousEntries(previousData as TimeEntry[])
      }
    } else {
      setPreviousEntries([])
    }

    setLoading(false)
  }

  // Calculate summary stats
  const totalEarnings = entries.reduce((sum, entry) => sum + entry.amount, 0)
  const totalHours = entries.reduce(
    (sum, entry) => sum + entry.duration_minutes / 60,
    0
  )
  const totalEntries = entries.length
  const averageHourlyRate = totalHours > 0 ? totalEarnings / totalHours : 0

  // Calculate previous period stats
  const previousTotalEarnings = previousEntries.reduce((sum, entry) => sum + entry.amount, 0)
  const previousTotalHours = previousEntries.reduce(
    (sum, entry) => sum + entry.duration_minutes / 60,
    0
  )
  const previousTotalEntries = previousEntries.length
  const previousAverageHourlyRate = previousTotalHours > 0 ? previousTotalEarnings / previousTotalHours : 0

  // Calculate percentage changes
  const earningsChange = previousTotalEarnings > 0
    ? ((totalEarnings - previousTotalEarnings) / previousTotalEarnings) * 100
    : 0
  const hoursChange = previousTotalHours > 0
    ? ((totalHours - previousTotalHours) / previousTotalHours) * 100
    : 0
  const entriesChange = previousTotalEntries > 0
    ? ((totalEntries - previousTotalEntries) / previousTotalEntries) * 100
    : 0
  const rateChange = previousAverageHourlyRate > 0
    ? ((averageHourlyRate - previousAverageHourlyRate) / previousAverageHourlyRate) * 100
    : 0

  // Calculate client breakdown
  const clientStats: ClientStats[] = []
  const clientMap = new Map<string, ClientStats>()

  entries.forEach((entry) => {
    const clientId = entry.client_id
    const clientName = entry.clients.name

    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        clientId,
        clientName,
        totalHours: 0,
        totalEarnings: 0,
        entryCount: 0,
        lastEntryDate: entry.start_time,
      })
    }

    const stats = clientMap.get(clientId)!
    stats.totalHours += entry.duration_minutes / 60
    stats.totalEarnings += entry.amount
    stats.entryCount += 1

    // Track most recent entry
    if (new Date(entry.start_time) > new Date(stats.lastEntryDate || 0)) {
      stats.lastEntryDate = entry.start_time
    }
  })

  // Calculate activity status (replaces health scores)
  clientMap.forEach((stats) => {
    const daysSinceLastEntry = stats.lastEntryDate
      ? Math.floor((Date.now() - new Date(stats.lastEntryDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999

    // Determine activity status
    let activityStatus: 'active' | 'inactive' | 'dormant'
    if (daysSinceLastEntry <= 7) {
      activityStatus = 'active'
    } else if (daysSinceLastEntry <= 30) {
      activityStatus = 'inactive'
    } else {
      activityStatus = 'dormant'
    }

    stats.activityStatus = activityStatus
    stats.daysSinceLastEntry = daysSinceLastEntry
    clientStats.push(stats)
  })

  clientStats.sort((a, b) => b.totalEarnings - a.totalEarnings)

  // Calculate project stats
  const projectStats: ProjectStats[] = []
  const projectMap = new Map<string, ProjectStats>()

  entries.forEach((entry) => {
    if (!entry.project_id) return

    const project = projects.find((p) => p.id === entry.project_id)
    if (!project) return

    if (!projectMap.has(entry.project_id)) {
      projectMap.set(entry.project_id, {
        projectId: entry.project_id,
        projectName: project.name,
        clientName: project.clients?.name || 'Unknown',
        totalHours: 0,
        totalEarnings: 0,
        budget: project.budget,
        percentUsed: 0,
        status: project.status,
      })
    }

    const stats = projectMap.get(entry.project_id)!
    stats.totalHours += entry.duration_minutes / 60
    stats.totalEarnings += entry.amount
  })

  // Calculate percent used for each project
  projectMap.forEach((stats) => {
    if (stats.budget && stats.budget > 0) {
      stats.percentUsed = (stats.totalEarnings / stats.budget) * 100
    }
    projectStats.push(stats)
  })

  projectStats.sort((a, b) => b.percentUsed - a.percentUsed)

  // Calculate earnings by day for chart
  const earningsByDay = new Map<string, number>()
  entries.forEach((entry) => {
    const date = new Date(entry.start_time).toLocaleDateString()
    earningsByDay.set(date, (earningsByDay.get(date) || 0) + entry.amount)
  })

  const chartData = Array.from(earningsByDay.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14) // Last 14 days

  const maxEarnings = Math.max(...chartData.map(d => d.amount), 1)

  const getPeriodLabel = () => {
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString()} - ${new Date(
        endDate
      ).toLocaleDateString()}`
    }
    switch (timePeriod) {
      case 'week':
        return 'Last 7 Days'
      case 'month':
        return 'Last 30 Days'
      case 'year':
        return 'Last Year'
      case 'all':
        return 'All Time'
    }
  }

  const exportToCSV = () => {
    if (entries.length === 0) {
      toast.warning('No data to export')
      return
    }

    const csvContent = generateTimeEntriesCSV(entries)
    const filename = `time-entries-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(csvContent, filename)
    toast.success('CSV exported!', `${entries.length} entries exported`)
  }

  const exportToPDF = () => {
    if (entries.length === 0) {
      toast.warning('No data to export')
      return
    }

    // Prepare data for PDF generation
    const reportData = {
      startDate: startDate || (timePeriod === 'week' ? formatDateForPDF(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) :
                 timePeriod === 'month' ? formatDateForPDF(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) :
                 timePeriod === 'year' ? formatDateForPDF(new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString()) :
                 'Beginning'),
      endDate: endDate || formatDateForPDF(new Date().toISOString()),
      totalEarnings,
      totalHours,
      totalEntries,
      clientBreakdown: clientStats.map(stats => ({
        clientName: stats.clientName,
        hours: stats.totalHours,
        entries: stats.entryCount,
        amount: stats.totalEarnings,
        avgRate: stats.totalHours > 0 ? stats.totalEarnings / stats.totalHours : 0,
      })),
    }

    try {
      generatePDFReport(reportData)
      toast.success('PDF exported!', 'Your report has been downloaded')
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF', 'Please try again')
    }
  }


  // Helper to get activity status color and label
  const getActivityStatus = (status: 'active' | 'inactive' | 'dormant') => {
    switch (status) {
      case 'active':
        return { color: 'bg-success', label: 'Active', textColor: 'text-success' }
      case 'inactive':
        return { color: 'bg-warning', label: 'Inactive', textColor: 'text-warning' }
      case 'dormant':
        return { color: 'bg-error', label: 'Dormant', textColor: 'text-error' }
    }
  }

  const getBudgetStatusColor = (percentUsed: number) => {
    if (percentUsed < 90) return '#047857' // green
    if (percentUsed < 100) return '#c2410c' // orange/yellow
    return '#b91c1c' // red
  }

  const loadSavedFilter = (filter: ReportFilter) => {
    setTimePeriod(filter.time_period)
    setStartDate(filter.start_date || '')
    setEndDate(filter.end_date || '')
    setSelectedClientIds(filter.selected_clients || [])
    setShowSavedFiltersDropdown(false)
    toast.success('Filter loaded', `Applied "${filter.name}"`)
  }

  const handleDeleteFilter = async (filterId: string, filterName: string) => {
    const success = await deleteReportFilter(filterId)
    if (success) {
      setSavedFilters(savedFilters.filter((f) => f.id !== filterId))
      toast.success('Filter deleted', `"${filterName}" has been removed`)
    } else {
      toast.error('Failed to delete filter')
    }
  }

  const handleFilterSaved = async () => {
    const filters = await getSavedFilters(userId)
    setSavedFilters(filters)
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex justify-end items-center gap-3 flex-wrap">
        <div className="relative">
          <Button
            onClick={() => setShowSavedFiltersDropdown(!showSavedFiltersDropdown)}
            variant="outline"
            size="lg"
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Filter className="h-5 w-5 mr-2" />
            Saved Filters
          </Button>
          {showSavedFiltersDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              {savedFilters.length === 0 ? (
                <div className="p-4 text-sm text-gray-500 text-center">
                  No saved filters yet
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <button
                        onClick={() => loadSavedFilter(filter)}
                        className="flex-1 text-left text-sm text-gray-900 hover:text-accent-primary"
                      >
                        {filter.name}
                      </button>
                      <button
                        onClick={() => handleDeleteFilter(filter.id, filter.name)}
                        className="text-gray-400 hover:text-error ml-2"
                        title="Delete filter"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <Button
          onClick={() => setShowSaveFilterModal(true)}
          variant="outline"
          size="lg"
          className="border-slate-300 text-slate-700 hover:bg-slate-100"
        >
          <Save className="h-5 w-5 mr-2" />
          Save Current Filter
        </Button>
        <Button
          onClick={exportToCSV}
          variant="outline"
          size="lg"
          className="border-accent-primary text-accent-primary hover:bg-accent-primary/10"
        >
          <FileSpreadsheet className="h-5 w-5 mr-2" />
          Export CSV
        </Button>
        <Button
          onClick={exportToPDF}
          variant="outline"
          size="lg"
          className="border-brand-green text-brand-green hover:bg-brand-green/10"
        >
          <Download className="h-5 w-5 mr-2" />
          Export Report
        </Button>
        <Button
          onClick={() => setShowInvoiceGenerator(true)}
          className="bg-brand-green hover:bg-brand-green/90 text-white"
          size="lg"
        >
          <FileText className="h-5 w-5 mr-2" />
          Generate Invoice
        </Button>
      </div>

      {/* Time Period Filters */}
      <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide">
            Time Period
          </h3>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="rounded"
              />
              Compare Periods
            </label>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => {
              setTimePeriod('week')
              setStartDate('')
              setEndDate('')
            }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              timePeriod === 'week' && !startDate
                ? 'bg-slate-950 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => {
              setTimePeriod('month')
              setStartDate('')
              setEndDate('')
            }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              timePeriod === 'month' && !startDate
                ? 'bg-slate-950 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => {
              setTimePeriod('year')
              setStartDate('')
              setEndDate('')
            }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              timePeriod === 'year' && !startDate
                ? 'bg-slate-950 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            Last Year
          </button>
          <button
            onClick={() => {
              setTimePeriod('all')
              setStartDate('')
              setEndDate('')
            }}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              timePeriod === 'all' && !startDate
                ? 'bg-slate-950 text-white'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            All Time
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-brand-charcoal mb-3">
            Custom Date Range
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="start-date"
                className="block text-sm text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
            <div>
              <label
                htmlFor="end-date"
                className="block text-sm text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Multi-Client Filter */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm font-medium text-brand-charcoal mb-3">
            Filter by Clients
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedClientIds([])}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                selectedClientIds.length === 0
                  ? 'bg-slate-950 text-white'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              All Clients
            </button>
            {clients.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  if (selectedClientIds.includes(client.id)) {
                    setSelectedClientIds(selectedClientIds.filter((id) => id !== client.id))
                  } else {
                    setSelectedClientIds([...selectedClientIds, client.id])
                  }
                }}
                className={`px-3 py-1.5 rounded text-sm transition-colors ${
                  selectedClientIds.includes(client.id)
                    ? 'bg-accent-primary text-white'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {client.name}
              </button>
            ))}
          </div>
          {selectedClientIds.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {selectedClientIds.length} {selectedClientIds.length === 1 ? 'client' : 'clients'} selected
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
          <div className="animate-pulse text-gray-600">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          {showComparison && previousEntries.length > 0 ? (
            /* Comparison View */
            <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-6">
                Period Comparison
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b-2 border-slate-300">
                    <tr>
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Metric
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Current
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Previous
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Change
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3 font-medium text-slate-950">Earnings</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-950">
                        ${totalEarnings.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        ${previousTotalEarnings.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-medium ${earningsChange >= 0 ? 'text-success' : 'text-error'}`}>
                          {earningsChange >= 0 ? '▲' : '▼'} ${Math.abs(totalEarnings - previousTotalEarnings).toFixed(2)} ({Math.abs(earningsChange).toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3 font-medium text-slate-950">Hours</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-950">
                        {totalHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {previousTotalHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-medium ${hoursChange >= 0 ? 'text-success' : 'text-error'}`}>
                          {hoursChange >= 0 ? '▲' : '▼'} {Math.abs(totalHours - previousTotalHours).toFixed(1)}h ({Math.abs(hoursChange).toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b border-slate-100">
                      <td className="py-3 px-3 font-medium text-slate-950">Entries</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-950">
                        {totalEntries}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {previousTotalEntries}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-medium ${entriesChange >= 0 ? 'text-success' : 'text-error'}`}>
                          {entriesChange >= 0 ? '▲' : '▼'} {Math.abs(totalEntries - previousTotalEntries)} ({Math.abs(entriesChange).toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-medium text-slate-950">Avg Rate</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-950">
                        ${averageHourlyRate.toFixed(0)}/hr
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        ${previousAverageHourlyRate.toFixed(0)}/hr
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-medium ${rateChange >= 0 ? 'text-success' : 'text-error'}`}>
                          {rateChange >= 0 ? '▲' : '▼'} ${Math.abs(averageHourlyRate - previousAverageHourlyRate).toFixed(2)} ({Math.abs(rateChange).toFixed(1)}%)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* Standard View */
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Earnings */}
              <div className="bg-white rounded border border-slate-200 p-6">
                <p className="text-xs text-slate-600 uppercase font-semibold mb-2 tracking-wide">Total Earnings</p>
                <p className="text-4xl font-bold text-slate-950 font-mono mb-2">
                  ${totalEarnings.toFixed(2)}
                </p>
                {previousEntries.length > 0 && !showComparison && (
                  <div className={`text-xs font-medium ${earningsChange >= 0 ? 'text-success' : 'text-error'}`}>
                    <span>
                      {earningsChange >= 0 ? '▲' : '▼'} {Math.abs(earningsChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Total Hours */}
              <div className="bg-white rounded border border-slate-200 p-6">
                <p className="text-xs text-slate-600 uppercase font-semibold mb-2 tracking-wide">Total Hours</p>
                <p className="text-4xl font-bold text-slate-950 font-mono mb-2">
                  {totalHours.toFixed(1)}
                </p>
                {previousEntries.length > 0 && !showComparison && (
                  <div className={`text-xs font-medium ${hoursChange >= 0 ? 'text-success' : 'text-error'}`}>
                    <span>
                      {hoursChange >= 0 ? '▲' : '▼'} {Math.abs(hoursChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Time Entries */}
              <div className="bg-white rounded border border-slate-200 p-6">
                <p className="text-xs text-slate-600 uppercase font-semibold mb-2 tracking-wide">Time Entries</p>
                <p className="text-4xl font-bold text-slate-950 font-mono mb-2">
                  {totalEntries}
                </p>
                {previousEntries.length > 0 && !showComparison && (
                  <div className={`text-xs font-medium ${entriesChange >= 0 ? 'text-success' : 'text-error'}`}>
                    <span>
                      {entriesChange >= 0 ? '▲' : '▼'} {Math.abs(entriesChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Average Rate */}
              <div className="bg-white rounded border border-slate-200 p-6">
                <p className="text-xs text-slate-600 uppercase font-semibold mb-2 tracking-wide">Avg Rate</p>
                <p className="text-4xl font-bold text-slate-950 font-mono mb-2">
                  ${averageHourlyRate.toFixed(0)}/hr
                </p>
                {previousEntries.length > 0 && !showComparison && (
                  <div className={`text-xs font-medium ${rateChange >= 0 ? 'text-success' : 'text-error'}`}>
                    <span>
                      {rateChange >= 0 ? '▲' : '▼'} {Math.abs(rateChange).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Goal Progress Rings */}
          {timePeriod === 'month' && !startDate && (
            <GoalProgress
              currentEarnings={totalEarnings}
              currentHours={totalHours}
              period={getPeriodLabel()}
            />
          )}

          {/* Earnings Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-6">
                Daily Earnings Trend
              </h3>
              <div className="space-y-2">
                {chartData.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-28 text-xs text-slate-600 flex-shrink-0">
                      {data.date}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 relative h-8 bg-slate-100 rounded overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-slate-800 rounded transition-all duration-300"
                          style={{
                            width: `${Math.max((data.amount / maxEarnings) * 100, 2)}%`
                          }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className="font-semibold text-slate-950 text-sm font-mono">
                          ${data.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Time Heatmap */}
          {entries.length > 0 && <TimeHeatmap entries={entries} />}

          {/* Project Breakdown */}
          {projectStats.length > 0 && (
            <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-6">
                Project Breakdown
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Project
                      </th>
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Client
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Hours
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Budget
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Spent
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Remaining
                      </th>
                      <th className="text-center py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        % Used
                      </th>
                      <th className="text-center py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectStats.map((stats) => {
                      const budgetColor = getBudgetStatusColor(stats.percentUsed)
                      const remaining = stats.budget ? stats.budget - stats.totalEarnings : 0

                      return (
                        <tr
                          key={stats.projectId}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-3 font-semibold text-slate-950 text-sm">
                            {stats.projectName}
                          </td>
                          <td className="py-3 px-3 text-slate-600 text-sm">
                            {stats.clientName}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 text-sm">
                            {stats.totalHours.toFixed(1)}h
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-950 text-sm">
                            {stats.budget ? `$${stats.budget.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-950 text-sm">
                            ${stats.totalEarnings.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600 text-sm">
                            {stats.budget ? `$${remaining.toFixed(2)}` : '-'}
                          </td>
                          <td className="py-3 px-3">
                            {stats.budget ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm font-medium" style={{ color: budgetColor }}>
                                  {stats.percentUsed.toFixed(1)}%
                                </span>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all"
                                    style={{
                                      width: `${Math.min(stats.percentUsed, 100)}%`,
                                      backgroundColor: budgetColor,
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-sm text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                                stats.status === 'active'
                                  ? 'bg-success/10 text-success'
                                  : stats.status === 'completed'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {stats.status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Client Breakdown */}
          <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-6">
              Breakdown by Client
            </h3>

            {clientStats.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p className="font-medium">No data for this period</p>
              </div>
            ) : (
              <>
                {/* Mobile Cards View */}
                <div className="md:hidden space-y-3">
                  {clientStats.map((stats) => {
                    const activity = getActivityStatus(stats.activityStatus || 'dormant')

                    return (
                      <div
                        key={stats.clientId}
                        className="bg-slate-50 rounded-md border border-slate-200 p-4"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-slate-950 text-base">
                            {stats.clientName}
                          </h4>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                            <span className={`text-xs font-medium ${activity.textColor}`}>
                              {activity.label}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Hours</p>
                            <p className="font-semibold text-slate-950">{stats.totalHours.toFixed(1)}h</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Entries</p>
                            <p className="font-semibold text-slate-950">{stats.entryCount}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Earnings</p>
                            <p className="font-bold text-slate-950 font-mono text-base">
                              ${stats.totalEarnings.toFixed(2)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Avg Rate</p>
                            <p className="font-semibold text-slate-950 font-mono">
                              ${stats.totalHours > 0 ? (stats.totalEarnings / stats.totalHours).toFixed(0) : 0}/hr
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Client
                      </th>
                      <th className="text-center py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Activity
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Hours
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Earnings
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Entries
                      </th>
                      <th className="text-right py-3 px-3 text-xs font-semibold uppercase text-slate-600 tracking-wide">
                        Avg Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientStats.map((stats) => {
                      const activity = getActivityStatus(stats.activityStatus || 'dormant')

                      return (
                        <tr
                          key={stats.clientId}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-3 font-semibold text-slate-950 text-sm">
                            {stats.clientName}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="flex items-center justify-center gap-2" title={`Last entry: ${stats.daysSinceLastEntry} days ago`}>
                              <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                              <span className={`text-xs font-medium ${activity.textColor}`}>{activity.label}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 text-sm">
                            {stats.totalHours.toFixed(1)}h
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-950 font-mono text-sm">
                            ${stats.totalEarnings.toFixed(2)}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 text-sm">
                            {stats.entryCount}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-600 text-sm font-mono">
                            $
                            {stats.totalHours > 0
                              ? (stats.totalEarnings / stats.totalHours).toFixed(
                                  0
                                )
                              : 0}
                            /hr
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t-2 border-slate-300">
                      <td className="py-3 px-3 text-slate-950 text-sm">Total</td>
                      <td className="py-3 px-3 text-center text-slate-950">—</td>
                      <td className="py-3 px-3 text-right text-slate-950 text-sm">
                        {totalHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-3 text-right text-slate-950 font-mono text-sm">
                        ${totalEarnings.toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-950 text-sm">
                        {totalEntries}
                      </td>
                      <td className="py-3 px-3 text-right text-slate-950 font-mono text-sm">
                        ${averageHourlyRate.toFixed(0)}/hr
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Invoice Generator Modal */}
      {showInvoiceGenerator && (
        <GenerateInvoice
          userId={userId}
          onClose={() => setShowInvoiceGenerator(false)}
        />
      )}

      {/* Save Filter Modal */}
      {showSaveFilterModal && (
        <SaveFilterModal
          userId={userId}
          timePeriod={timePeriod}
          startDate={startDate}
          endDate={endDate}
          selectedClients={selectedClientIds}
          onClose={() => setShowSaveFilterModal(false)}
          onSaved={handleFilterSaved}
        />
      )}
    </div>
  )
}
