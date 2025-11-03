import { posthog } from './posthog-client'

export type AnalyticsEvent =
  | 'user_signed_up'
  | 'user_upgraded'
  | 'timer_started'
  | 'timer_stopped'
  | 'client_added'
  | 'project_created'
  | 'invoice_generated'
  | 'report_viewed'
  | 'csv_exported'
  | 'pdf_exported'
  | 'manual_entry_added'
  | 'bulk_delete'
  | 'bulk_edit'
  | 'filter_saved'
  | 'error_occurred'

interface EventProperties {
  [key: string]: any
}

/**
 * Track an analytics event
 */
export function trackEvent(event: AnalyticsEvent, properties?: EventProperties) {
  if (typeof window === 'undefined') return

  // Check if user has opted out of analytics
  const analyticsEnabled = localStorage.getItem('analytics_enabled')
  if (analyticsEnabled === 'false') return

  try {
    posthog.capture(event, properties)
  } catch (error) {
    console.error('Analytics error:', error)
  }
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (typeof window === 'undefined') return

  try {
    posthog.identify(userId, traits)
  } catch (error) {
    console.error('Analytics identify error:', error)
  }
}

/**
 * Reset analytics (on logout)
 */
export function resetAnalytics() {
  if (typeof window === 'undefined') return

  try {
    posthog.reset()
  } catch (error) {
    console.error('Analytics reset error:', error)
  }
}

/**
 * Track page view
 */
export function trackPageView(pageName: string) {
  if (typeof window === 'undefined') return

  try {
    posthog.capture('$pageview', { page: pageName })
  } catch (error) {
    console.error('Analytics pageview error:', error)
  }
}
