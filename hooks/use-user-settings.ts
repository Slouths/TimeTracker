'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserSettings {
  id: string
  user_id: string
  business_name: string
  currency: string
  date_format: string
  time_format: '12h' | '24h'
  timezone: string
  hourly_rate_default: number
  time_rounding: number
  invoice_prefix: string
  invoice_next_number: number
  payment_terms_days: number
  tax_rate: number
  auto_start_timer: boolean
  idle_timeout_minutes: number
  notification_email: boolean
  notification_browser: boolean
}

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No user found')
      }

      const { data, error: fetchError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        // If no settings exist, create defaults
        if (fetchError.code === 'PGRST116') {
          const defaultSettings = {
            user_id: user.id,
            business_name: '',
            currency: 'USD',
            date_format: 'MM/DD/YYYY',
            time_format: '12h' as const,
            timezone: 'America/New_York',
            hourly_rate_default: 50,
            time_rounding: 0,
            invoice_prefix: 'INV',
            invoice_next_number: 1001,
            payment_terms_days: 30,
            tax_rate: 0,
            auto_start_timer: false,
            idle_timeout_minutes: 15,
            notification_email: true,
            notification_browser: false,
          }

          const { data: newSettings, error: insertError } = await supabase
            .from('user_settings')
            .insert(defaultSettings)
            .select()
            .single()

          if (insertError) throw insertError

          setSettings(newSettings)
        } else {
          throw fetchError
        }
      } else {
        setSettings(data)
      }
    } catch (err) {
      setError(err as Error)
      console.error('Error loading user settings:', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateSettings(updates: Partial<UserSettings>) {
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('No user found')
      }

      const { data, error: updateError } = await supabase
        .from('user_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      setSettings(data)
      return { success: true, data }
    } catch (err) {
      console.error('Error updating settings:', err)
      return { success: false, error: err }
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: loadSettings,
  }
}
