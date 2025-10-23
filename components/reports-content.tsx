'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DollarSign, Clock, Users, TrendingUp, FileText, ArrowUp, ArrowDown, Download } from 'lucide-react'
import { GenerateInvoice } from './generate-invoice'
import { Button } from './ui/button'
import { GoalProgress } from './goal-progress'
import { TimeHeatmap } from './time-heatmap'

interface TimeEntry {
  id: string
  client_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  amount: number
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
  healthScore?: number
  lastEntryDate?: string
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

  const supabase = createClient()

  useEffect(() => {
    loadEntries()
  }, [userId, timePeriod, startDate, endDate])

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

  // Calculate health scores
  clientMap.forEach((stats) => {
    let healthScore = 100

    // Factor 1: Recent activity (40 points)
    const daysSinceLastEntry = stats.lastEntryDate
      ? Math.floor((Date.now() - new Date(stats.lastEntryDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999
    if (daysSinceLastEntry > 30) healthScore -= 40
    else if (daysSinceLastEntry > 14) healthScore -= 30
    else if (daysSinceLastEntry > 7) healthScore -= 15

    // Factor 2: Entry frequency (30 points)
    const avgDaysBetweenEntries = timePeriod === 'month' ? 30 / (stats.entryCount || 1) : 0
    if (avgDaysBetweenEntries > 10) healthScore -= 30
    else if (avgDaysBetweenEntries > 5) healthScore -= 15

    // Factor 3: Earnings consistency (30 points)
    const avgPerEntry = stats.totalEarnings / (stats.entryCount || 1)
    if (avgPerEntry < 50) healthScore -= 30
    else if (avgPerEntry < 100) healthScore -= 15

    stats.healthScore = Math.max(0, Math.min(100, healthScore))
    clientStats.push(stats)
  })

  clientStats.sort((a, b) => b.totalEarnings - a.totalEarnings)

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

  const exportToPDF = () => {
    const reportHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>TradeTimer Report - ${getPeriodLabel()}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 40px auto; padding: 20px; color: #334155; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #219ebc; padding-bottom: 20px; }
    .company-name { font-size: 36px; font-weight: bold; color: #334155; margin-bottom: 10px; }
    .report-title { font-size: 24px; color: #64748b; margin-bottom: 5px; }
    .period { font-size: 14px; color: #94a3b8; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
    .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; margin-bottom: 8px; }
    .stat-value { font-size: 28px; font-weight: bold; color: #334155; margin-bottom: 4px; }
    .stat-change { font-size: 14px; margin-top: 8px; }
    .positive { color: #10b981; }
    .negative { color: #ef4444; }
    .section-title { font-size: 20px; font-weight: bold; color: #334155; margin: 40px 0 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: #f1f5f9; padding: 12px; text-align: left; font-weight: bold; color: #334155; border-bottom: 2px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    .text-right { text-align: right; }
    .footer { margin-top: 60px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 2px solid #e2e8f0; padding-top: 20px; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="company-name">TradeTimer</div>
    <div class="report-title">Earnings & Analytics Report</div>
    <div class="period">${getPeriodLabel()}</div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Total Earnings</div>
      <div class="stat-value">$${totalEarnings.toFixed(2)}</div>
      ${previousEntries.length > 0 ? `
        <div class="stat-change ${earningsChange >= 0 ? 'positive' : 'negative'}">
          ${earningsChange >= 0 ? '▲' : '▼'} ${Math.abs(earningsChange).toFixed(1)}% vs previous
        </div>
      ` : ''}
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Hours</div>
      <div class="stat-value">${totalHours.toFixed(1)}</div>
      ${previousEntries.length > 0 ? `
        <div class="stat-change ${hoursChange >= 0 ? 'positive' : 'negative'}">
          ${hoursChange >= 0 ? '▲' : '▼'} ${Math.abs(hoursChange).toFixed(1)}% vs previous
        </div>
      ` : ''}
    </div>
    <div class="stat-card">
      <div class="stat-label">Time Entries</div>
      <div class="stat-value">${totalEntries}</div>
      ${previousEntries.length > 0 ? `
        <div class="stat-change ${entriesChange >= 0 ? 'positive' : 'negative'}">
          ${entriesChange >= 0 ? '▲' : '▼'} ${Math.abs(entriesChange).toFixed(1)}% vs previous
        </div>
      ` : ''}
    </div>
    <div class="stat-card">
      <div class="stat-label">Avg Rate</div>
      <div class="stat-value">$${averageHourlyRate.toFixed(0)}/hr</div>
      ${previousEntries.length > 0 ? `
        <div class="stat-change ${rateChange >= 0 ? 'positive' : 'negative'}">
          ${rateChange >= 0 ? '▲' : '▼'} ${Math.abs(rateChange).toFixed(1)}% vs previous
        </div>
      ` : ''}
    </div>
  </div>

  <div class="section-title">Breakdown by Client</div>
  <table>
    <thead>
      <tr>
        <th>Client</th>
        <th class="text-right">Hours</th>
        <th class="text-right">Earnings</th>
        <th class="text-right">Entries</th>
        <th class="text-right">Avg Rate</th>
      </tr>
    </thead>
    <tbody>
      ${clientStats.map(stats => `
        <tr>
          <td><strong>${stats.clientName}</strong></td>
          <td class="text-right">${stats.totalHours.toFixed(1)}h</td>
          <td class="text-right" style="color: #219ebc; font-weight: bold;">$${stats.totalEarnings.toFixed(2)}</td>
          <td class="text-right">${stats.entryCount}</td>
          <td class="text-right">$${stats.totalHours > 0 ? (stats.totalEarnings / stats.totalHours).toFixed(0) : 0}/hr</td>
        </tr>
      `).join('')}
      <tr style="background: #f8fafc; font-weight: bold;">
        <td>TOTAL</td>
        <td class="text-right">${totalHours.toFixed(1)}h</td>
        <td class="text-right" style="color: #219ebc;">$${totalEarnings.toFixed(2)}</td>
        <td class="text-right">${totalEntries}</td>
        <td class="text-right">$${averageHourlyRate.toFixed(0)}/hr</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Generated by TradeTimer on ${new Date().toLocaleDateString()}</p>
    <p style="margin-top: 8px;">This report is for informational purposes. Please consult with a tax professional for tax-related questions.</p>
  </div>
</body>
</html>
    `

    const blob = new Blob([reportHTML], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `TradeTimer-Report-${getPeriodLabel().replace(/\s+/g, '-')}-${Date.now()}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex justify-end items-center gap-3">
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
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-brand-charcoal mb-4">
          Time Period
        </h3>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={() => {
              setTimePeriod('week')
              setStartDate('')
              setEndDate('')
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timePeriod === 'week' && !startDate
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timePeriod === 'month' && !startDate
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timePeriod === 'year' && !startDate
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              timePeriod === 'all' && !startDate
                ? 'bg-brand-green text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
          <div className="animate-pulse text-gray-600">Loading reports...</div>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Earnings */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 text-center">
              <DollarSign className="h-6 w-6 text-brand-green mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Total Earnings</p>
              <p className="text-3xl font-bold text-brand-charcoal mb-2">
                ${totalEarnings.toFixed(2)}
              </p>
              {previousEntries.length > 0 && (
                <div className={`flex items-center justify-center gap-1 mb-2 ${earningsChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {earningsChange >= 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(earningsChange).toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">{getPeriodLabel()}</p>
            </div>

            {/* Total Hours */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 text-center">
              <Clock className="h-6 w-6 text-brand-green mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Total Hours</p>
              <p className="text-3xl font-bold text-brand-charcoal mb-2">
                {totalHours.toFixed(1)}
              </p>
              {previousEntries.length > 0 && (
                <div className={`flex items-center justify-center gap-1 mb-2 ${hoursChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {hoursChange >= 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(hoursChange).toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">{getPeriodLabel()}</p>
            </div>

            {/* Time Entries */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 text-center">
              <Users className="h-6 w-6 text-brand-green mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Time Entries</p>
              <p className="text-3xl font-bold text-brand-charcoal mb-2">
                {totalEntries}
              </p>
              {previousEntries.length > 0 && (
                <div className={`flex items-center justify-center gap-1 mb-2 ${entriesChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {entriesChange >= 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(entriesChange).toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">{getPeriodLabel()}</p>
            </div>

            {/* Average Rate */}
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 text-center">
              <TrendingUp className="h-6 w-6 text-brand-green mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-2">Avg Rate</p>
              <p className="text-3xl font-bold text-brand-charcoal mb-2">
                ${averageHourlyRate.toFixed(0)}/hr
              </p>
              {previousEntries.length > 0 && (
                <div className={`flex items-center justify-center gap-1 mb-2 ${rateChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {rateChange >= 0 ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                  <span className="text-sm font-semibold">
                    {Math.abs(rateChange).toFixed(1)}%
                  </span>
                </div>
              )}
              <p className="text-xs text-gray-500">{getPeriodLabel()}</p>
            </div>
          </div>

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
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-brand-charcoal mb-6">
                Daily Earnings Trend
              </h3>
              <div className="space-y-2">
                {chartData.map((data, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-28 text-sm text-gray-600 flex-shrink-0">
                      {data.date}
                    </div>
                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1 relative h-10 bg-gray-100 rounded-lg overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 bg-brand-green rounded-lg transition-all duration-300"
                          style={{
                            width: `${Math.max((data.amount / maxEarnings) * 100, 2)}%`
                          }}
                        />
                      </div>
                      <div className="w-20 text-right">
                        <span className="font-semibold text-brand-charcoal text-sm">
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

          {/* Client Breakdown */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-brand-charcoal mb-6">
              Breakdown by Client
            </h3>

            {clientStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p className="font-medium">No data for this period</p>
              </div>
            ) : (
              <>
                {/* Visual breakdown */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium text-gray-600">Revenue Distribution</span>
                  </div>
                  <div className="flex h-12 rounded-lg overflow-hidden">
                    {clientStats.map((stats, index) => {
                      const percentage = (stats.totalEarnings / totalEarnings) * 100
                      const colors = [
                        'bg-brand-green',
                        'bg-brand-sky',
                        'bg-brand-amber',
                        'bg-purple-500',
                        'bg-pink-500',
                        'bg-indigo-500',
                      ]
                      const color = colors[index % colors.length]

                      return percentage > 0 ? (
                        <div
                          key={stats.clientId}
                          className={`${color} flex items-center justify-center text-white text-sm font-semibold transition-all hover:opacity-80 cursor-pointer group relative`}
                          style={{ width: `${percentage}%` }}
                          title={`${stats.clientName}: $${stats.totalEarnings.toFixed(2)} (${percentage.toFixed(1)}%)`}
                        >
                          {percentage > 10 && (
                            <span className="truncate px-2">
                              {percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      ) : null
                    })}
                  </div>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {clientStats.slice(0, 6).map((stats, index) => {
                      const colors = [
                        'bg-brand-green',
                        'bg-brand-sky',
                        'bg-brand-amber',
                        'bg-purple-500',
                        'bg-pink-500',
                        'bg-indigo-500',
                      ]
                      const color = colors[index % colors.length]
                      const percentage = (stats.totalEarnings / totalEarnings) * 100

                      return (
                        <div key={stats.clientId} className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color}`}></div>
                          <span className="text-sm text-gray-700">
                            {stats.clientName} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Detailed table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                        Client
                      </th>
                      <th className="text-center py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                        Health
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                        Hours
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                        Earnings
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                        Entries
                      </th>
                      <th className="text-right py-3 px-4 text-xs font-semibold uppercase text-gray-600">
                        Avg Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientStats.map((stats) => {
                      const healthColor =
                        (stats.healthScore || 0) >= 75 ? 'bg-green-500' :
                        (stats.healthScore || 0) >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'

                      return (
                        <tr
                          key={stats.clientId}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 font-semibold text-brand-charcoal">
                            {stats.clientName}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${healthColor}`} title={`Health Score: ${stats.healthScore}`}></div>
                              <span className="text-xs text-gray-600">{stats.healthScore}%</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {stats.totalHours.toFixed(1)}h
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-brand-green">
                            ${stats.totalEarnings.toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {stats.entryCount}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
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
                    <tr className="bg-gray-50 font-bold">
                      <td className="py-3 px-4 text-brand-charcoal">Total</td>
                      <td className="py-3 px-4 text-center text-brand-charcoal">—</td>
                      <td className="py-3 px-4 text-right text-brand-charcoal">
                        {totalHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-4 text-right text-brand-green">
                        ${totalEarnings.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right text-brand-charcoal">
                        {totalEntries}
                      </td>
                      <td className="py-3 px-4 text-right text-brand-charcoal">
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
    </div>
  )
}
