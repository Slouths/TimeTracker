import { SupabaseClient } from '@supabase/supabase-js'
import { RoundingOption } from './time-utils'

export interface UserSettings {
  id: string
  user_id: string
  timezone: string
  date_format: string
  time_format: '12h' | '24h'
  currency: string
  time_rounding: RoundingOption
  idle_timeout: number // in seconds
  auto_start_timer: boolean
  created_at: string
  updated_at: string
}

export type UserSettingsInput = Omit<
  UserSettings,
  'id' | 'created_at' | 'updated_at'
>

export type UserSettingsUpdate = Partial<
  Omit<UserSettings, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>

/**
 * Get user settings or return defaults if none exist
 */
export async function getUserSettings(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    // PGRST116 is "no rows returned"
    console.error('Error fetching user settings:', error)
    return null
  }

  return data
}

/**
 * Get user settings with defaults if none exist
 */
export async function getUserSettingsWithDefaults(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSettings> {
  const settings = await getUserSettings(supabase, userId)

  if (settings) {
    return settings
  }

  // Return default settings
  return {
    id: '',
    user_id: userId,
    timezone: 'UTC',
    date_format: 'MM/DD/YYYY',
    time_format: '12h',
    currency: 'USD',
    time_rounding: 'none',
    idle_timeout: 300,
    auto_start_timer: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

/**
 * Create user settings
 */
export async function createUserSettings(
  supabase: SupabaseClient,
  settings: UserSettingsInput
): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .insert(settings)
    .select()
    .single()

  if (error) {
    console.error('Error creating user settings:', error)
    return null
  }

  return data
}

/**
 * Update user settings
 */
export async function updateUserSettings(
  supabase: SupabaseClient,
  userId: string,
  updates: UserSettingsUpdate
): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user settings:', error)
    return null
  }

  return data
}

/**
 * Create or update user settings (upsert)
 */
export async function upsertUserSettings(
  supabase: SupabaseClient,
  settings: UserSettingsInput
): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(settings, {
      onConflict: 'user_id',
    })
    .select()
    .single()

  if (error) {
    console.error('Error upserting user settings:', error)
    return null
  }

  return data
}

/**
 * Available timezone options (subset of common timezones)
 */
export const TIMEZONE_OPTIONS = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
]

/**
 * Date format options
 */
export const DATE_FORMAT_OPTIONS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (US)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (UK)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (ISO)' },
]

/**
 * Time format options
 */
export const TIME_FORMAT_OPTIONS = [
  { value: '12h', label: '12-hour (AM/PM)' },
  { value: '24h', label: '24-hour' },
]

/**
 * Currency options
 */
export const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
]

/**
 * Time rounding options
 */
export const TIME_ROUNDING_OPTIONS = [
  { value: 'none', label: 'No rounding' },
  { value: '15min', label: '15 minutes' },
  { value: '30min', label: '30 minutes' },
  { value: '1hour', label: '1 hour' },
]

/**
 * Idle timeout options (in seconds)
 */
export const IDLE_TIMEOUT_OPTIONS = [
  { value: 300, label: '5 minutes' },
  { value: 600, label: '10 minutes' },
  { value: 900, label: '15 minutes' },
  { value: 1800, label: '30 minutes' },
  { value: 0, label: 'Never' },
]
