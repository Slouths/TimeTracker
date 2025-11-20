'use client'

import { useEffect, useState } from 'react'
import { MetricCard } from './metric-card'
import { DollarSign, Clock, Users, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DashboardMetricsProps {
  userId: string
}

interface Metrics {
  totalEarnings: number
  previousEarnings: number
  hoursTracked: number
  previousHours: number
  activeClients: number
  previousActiveClients: number
  averageRate: number
  previousAverageRate: number
}

export function DashboardMetrics({ userId }: DashboardMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchMetrics() {
      setLoading(true)

      const now = new Date()
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

      // Fetch this month's data
      const { data: thisMonthEntries } = await supabase
        .from('time_entries')
        .select('duration_minutes, amount, client_id')
        .eq('user_id', userId)
        .gte('start_time', firstDayThisMonth.toISOString())

      // Fetch last month's data
      const { data: lastMonthEntries } = await supabase
        .from('time_entries')
        .select('duration_minutes, amount, client_id')
        .eq('user_id', userId)
        .gte('start_time', firstDayLastMonth.toISOString())
        .lte('start_time', lastDayLastMonth.toISOString())

      // Fetch all clients
      const { data: clients } = await supabase
        .from('clients')
        .select('hourly_rate')
        .eq('user_id', userId)

      // Calculate this month metrics
      const totalEarnings = thisMonthEntries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0
      const hoursTracked = (thisMonthEntries?.reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0) / 60
      const activeClientsSet = new Set(thisMonthEntries?.map(e => e.client_id) || [])
      const activeClients = activeClientsSet.size

      // Calculate last month metrics
      const previousEarnings = lastMonthEntries?.reduce((sum, entry) => sum + (entry.amount || 0), 0) || 0
      const previousHours = (lastMonthEntries?.reduce((sum, entry) => sum + entry.duration_minutes, 0) || 0) / 60
      const previousActiveClientsSet = new Set(lastMonthEntries?.map(e => e.client_id) || [])
      const previousActiveClients = previousActiveClientsSet.size

      // Calculate average hourly rate
      const averageRate = clients?.length
        ? clients.reduce((sum, client) => sum + client.hourly_rate, 0) / clients.length
        : 0
      const previousAverageRate = averageRate // For simplicity, using same value

      setMetrics({
        totalEarnings,
        previousEarnings,
        hoursTracked,
        previousHours,
        activeClients,
        previousActiveClients,
        averageRate,
        previousAverageRate,
      })

      setLoading(false)
    }

    fetchMetrics()
  }, [userId, supabase])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <MetricCard
        icon={<DollarSign className="h-6 w-6" />}
        label="Total Earnings (This Month)"
        value={metrics?.totalEarnings || 0}
        previousValue={metrics?.previousEarnings}
        format="currency"
        iconColor="green"
        loading={loading}
      />

      <MetricCard
        icon={<Clock className="h-6 w-6" />}
        label="Hours Tracked (This Month)"
        value={metrics?.hoursTracked || 0}
        previousValue={metrics?.previousHours}
        format="number"
        iconColor="blue"
        decimals={1}
        loading={loading}
      />

      <MetricCard
        icon={<Users className="h-6 w-6" />}
        label="Active Clients"
        value={metrics?.activeClients || 0}
        previousValue={metrics?.previousActiveClients}
        format="number"
        iconColor="purple"
        decimals={0}
        loading={loading}
      />

      <MetricCard
        icon={<TrendingUp className="h-6 w-6" />}
        label="Average Hourly Rate"
        value={metrics?.averageRate || 0}
        previousValue={metrics?.previousAverageRate}
        format="currency"
        iconColor="orange"
        loading={loading}
      />
    </div>
  )
}
