'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { DisplayPreferences } from '@/components/settings/display-preferences'
import { TimerPreferences } from '@/components/settings/timer-preferences'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'
import {
  getUserSettingsWithDefaults,
  upsertUserSettings,
  UserSettings,
} from '@/lib/user-settings'
import { RoundingOption } from '@/lib/time-utils'
import type { User } from '@supabase/supabase-js'
import { Crown, Clock, DollarSign, FileText, Users } from 'lucide-react'

interface Subscription {
  plan: string
  status: string
  current_period_end: string | null
}

interface UserStats {
  totalClients: number
  totalEntries: number
  totalEarnings: number
  totalHours: number
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadUserAndSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load settings
      const userSettings = await getUserSettingsWithDefaults(supabase, user.id)
      setSettings(userSettings)

      // Load subscription data
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan, status, current_period_end')
        .eq('user_id', user.id)
        .single()

      if (subData) {
        setSubscription(subData)
      } else {
        setSubscription({ plan: 'free', status: 'active', current_period_end: null })
      }

      // Load user stats
      const { data: clients } = await supabase
        .from('clients')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)

      const { data: entries } = await supabase
        .from('time_entries')
        .select('duration_minutes, amount')
        .eq('user_id', user.id)

      const totalClients = clients?.length || 0
      const totalEntries = entries?.length || 0
      const totalEarnings = entries?.reduce((sum, entry) => sum + entry.amount, 0) || 0
      const totalHours = entries?.reduce((sum, entry) => sum + entry.duration_minutes / 60, 0) || 0

      setStats({ totalClients, totalEntries, totalEarnings, totalHours })

      setLoading(false)
    }

    loadUserAndSettings()
  }, [supabase, router])

  const handleSave = async () => {
    if (!user || !settings) return

    setSaving(true)

    const result = await upsertUserSettings(supabase, {
      user_id: user.id,
      timezone: settings.timezone,
      date_format: settings.date_format,
      time_format: settings.time_format,
      currency: settings.currency,
      time_rounding: settings.time_rounding,
      idle_timeout: settings.idle_timeout,
      auto_start_timer: settings.auto_start_timer,
    })

    if (result) {
      toast.success('Settings saved!', 'Your preferences have been updated')
      setSettings(result)
    } else {
      toast.error('Failed to save settings', 'Please try again')
    }

    setSaving(false)
  }

  if (loading || !user || !settings) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
                <div className="h-10 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">
            Profile & Settings
          </h1>
          <p className="text-gray-600">
            Manage your account and preferences
          </p>
        </div>

        {/* Subscription Status */}
        {subscription && (
          <div className="bg-gradient-to-r from-brand-green/10 to-brand-sky/10 rounded-xl p-6 mb-6 border border-brand-green/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className={`h-8 w-8 ${subscription.plan === 'pro' ? 'text-brand-green' : 'text-gray-400'}`} />
                <div>
                  <h3 className="text-lg font-bold text-brand-charcoal">
                    {subscription.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Status: <span className="font-medium capitalize">{subscription.status}</span>
                    {subscription.current_period_end && (
                      <> · Renews {new Date(subscription.current_period_end).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              </div>
              {subscription.plan === 'free' && (
                <Button className="bg-brand-green hover:bg-brand-green/90 text-white">
                  Upgrade to Pro
                </Button>
              )}
            </div>
          </div>
        )}

        {/* User Statistics */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Users className="h-5 w-5 text-brand-green" />
                <p className="text-sm font-medium text-gray-600">Clients</p>
              </div>
              <p className="text-3xl font-bold text-brand-charcoal">{stats.totalClients}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-brand-green" />
                <p className="text-sm font-medium text-gray-600">Entries</p>
              </div>
              <p className="text-3xl font-bold text-brand-charcoal">{stats.totalEntries}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="h-5 w-5 text-brand-green" />
                <p className="text-sm font-medium text-gray-600">Hours</p>
              </div>
              <p className="text-3xl font-bold text-brand-charcoal">{stats.totalHours.toFixed(1)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-5 w-5 text-brand-green" />
                <p className="text-sm font-medium text-gray-600">Earnings</p>
              </div>
              <p className="text-3xl font-bold text-brand-charcoal">${stats.totalEarnings.toFixed(0)}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Account Information */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-brand-charcoal mb-6">
              Account Information
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <p className="text-brand-charcoal font-semibold">
                  {user.email}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <p className="text-gray-600 text-sm font-mono break-all">
                  {user.id}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Created
                </label>
                <p className="text-gray-600">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Sign In
                </label>
                <p className="text-gray-600">
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Display Preferences */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <DisplayPreferences
              timezone={settings.timezone}
              dateFormat={settings.date_format}
              timeFormat={settings.time_format}
              currency={settings.currency}
              onTimezoneChange={(value) =>
                setSettings({ ...settings, timezone: value })
              }
              onDateFormatChange={(value) =>
                setSettings({ ...settings, date_format: value })
              }
              onTimeFormatChange={(value) =>
                setSettings({ ...settings, time_format: value })
              }
              onCurrencyChange={(value) =>
                setSettings({ ...settings, currency: value })
              }
            />
          </div>
        </div>

        {/* Timer Preferences */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 mb-6">
          <TimerPreferences
            timeRounding={settings.time_rounding}
            idleTimeout={settings.idle_timeout}
            autoStartTimer={settings.auto_start_timer}
            onTimeRoundingChange={(value: RoundingOption) =>
              setSettings({ ...settings, time_rounding: value })
            }
            onIdleTimeoutChange={(value) =>
              setSettings({ ...settings, idle_timeout: value })
            }
            onAutoStartTimerChange={(value) =>
              setSettings({ ...settings, auto_start_timer: value })
            }
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-accent-primary hover:bg-accent-primary/90 text-white px-8 py-3 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </main>
    </div>
  )
}
