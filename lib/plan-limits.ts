import { SupabaseClient } from '@supabase/supabase-js'

export type PlanType = 'free' | 'pro'

export interface PlanLimits {
  maxClients: number | 'unlimited'
  maxEntriesPerMonth: number | 'unlimited'
  hasAdvancedAnalytics: boolean
  hasProjectTracking: boolean
  hasPdfExport: boolean
  hasCsvExport: boolean
  hasPrioritySupport: boolean
}

export const PLAN_LIMITS: Record<PlanType, PlanLimits> = {
  free: {
    maxClients: 1,
    maxEntriesPerMonth: 10,
    hasAdvancedAnalytics: false,
    hasProjectTracking: false,
    hasPdfExport: false,
    hasCsvExport: true,
    hasPrioritySupport: false,
  },
  pro: {
    maxClients: 'unlimited',
    maxEntriesPerMonth: 'unlimited',
    hasAdvancedAnalytics: true,
    hasProjectTracking: true,
    hasPdfExport: true,
    hasCsvExport: true,
    hasPrioritySupport: true,
  },
}

export interface UserSubscription {
  plan: PlanType
  status: string
  current_period_end: string | null
}

/**
 * Get user's current subscription plan
 */
export async function getUserPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<PlanType> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (data && data.plan === 'pro') {
    return 'pro'
  }

  return 'free'
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(
  supabase: SupabaseClient,
  userId: string
): Promise<UserSubscription | null> {
  const { data } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end')
    .eq('user_id', userId)
    .single()

  return data as UserSubscription | null
}

/**
 * Check if user can add more clients
 */
export async function canAddClient(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; reason?: string; currentCount?: number }> {
  const plan = await getUserPlan(supabase, userId)
  const limits = PLAN_LIMITS[plan]

  if (limits.maxClients === 'unlimited') {
    return { allowed: true }
  }

  const { count } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  const currentCount = count || 0

  if (currentCount >= limits.maxClients) {
    return {
      allowed: false,
      reason: `Free plan is limited to ${limits.maxClients} client. Upgrade to Pro for unlimited clients.`,
      currentCount,
    }
  }

  return { allowed: true, currentCount }
}

/**
 * Check if user can add more time entries this month
 */
export async function canAddTimeEntry(
  supabase: SupabaseClient,
  userId: string
): Promise<{ allowed: boolean; reason?: string; currentCount?: number }> {
  const plan = await getUserPlan(supabase, userId)
  const limits = PLAN_LIMITS[plan]

  if (limits.maxEntriesPerMonth === 'unlimited') {
    return { allowed: true }
  }

  // Get start and end of current month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const { count } = await supabase
    .from('time_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString())

  const currentCount = count || 0

  if (currentCount >= limits.maxEntriesPerMonth) {
    return {
      allowed: false,
      reason: `Free plan is limited to ${limits.maxEntriesPerMonth} time entries per month. Upgrade to Pro for unlimited entries.`,
      currentCount,
    }
  }

  return { allowed: true, currentCount }
}

/**
 * Get usage statistics for the current month
 */
export async function getUsageStats(
  supabase: SupabaseClient,
  userId: string
): Promise<{
  plan: PlanType
  clientCount: number
  clientLimit: number | 'unlimited'
  entriesThisMonth: number
  entriesLimit: number | 'unlimited'
}> {
  const plan = await getUserPlan(supabase, userId)
  const limits = PLAN_LIMITS[plan]

  // Get client count
  const { count: clientCount } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get entries this month
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const { count: entriesCount } = await supabase
    .from('time_entries')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())
    .lte('created_at', endOfMonth.toISOString())

  return {
    plan,
    clientCount: clientCount || 0,
    clientLimit: limits.maxClients,
    entriesThisMonth: entriesCount || 0,
    entriesLimit: limits.maxEntriesPerMonth,
  }
}

/**
 * Check if a feature is available for user's plan
 */
export async function hasFeature(
  supabase: SupabaseClient,
  userId: string,
  feature: keyof Omit<PlanLimits, 'maxClients' | 'maxEntriesPerMonth'>
): Promise<boolean> {
  const plan = await getUserPlan(supabase, userId)
  const limits = PLAN_LIMITS[plan]
  return limits[feature]
}
