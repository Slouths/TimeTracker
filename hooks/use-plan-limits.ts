'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
// Plan limits types

interface PlanLimits {
  canAddClient: boolean
  canStartTimer: boolean
  canExportPDF: boolean
  canUseProjects: boolean
  clientsUsed: number
  clientsLimit: number
  hoursThisMonth: number
  hoursLimit: number
  plan: 'free' | 'pro'
}

export function usePlanLimits() {
  const [limits, setLimits] = useState<PlanLimits>({
    canAddClient: true,
    canStartTimer: true,
    canExportPDF: false,
    canUseProjects: false,
    clientsUsed: 0,
    clientsLimit: 1,
    hoursThisMonth: 0,
    hoursLimit: 40,
    plan: 'free',
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadLimits()
  }, [])

  async function loadLimits() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setLoading(false)
        return
      }

      // Get subscription
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status, end_date')
        .eq('user_id', user.id)
        .single()

      const plan = subscription?.plan || 'free'
      const isActive = subscription?.status === 'active' || false

      // Get client count
      const { count: clientCount } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get this month's hours
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: entries } = await supabase
        .from('time_entries')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('start_time', startOfMonth.toISOString())

      const totalMinutes = entries?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0
      const totalHours = totalMinutes / 60

      // Set limits based on plan
      const isPro = plan === 'pro' && isActive

      const limits: PlanLimits = {
        plan: isPro ? 'pro' : 'free',
        canAddClient: isPro || (clientCount || 0) < 1,
        canStartTimer: isPro || totalHours < 40,
        canExportPDF: isPro,
        canUseProjects: isPro,
        clientsUsed: clientCount || 0,
        clientsLimit: isPro ? 999 : 1,
        hoursThisMonth: totalHours,
        hoursLimit: isPro ? 999 : 40,
      }

      setLimits(limits)
    } catch (error) {
      console.error('Error loading plan limits:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    ...limits,
    loading,
    refresh: loadLimits,
  }
}
