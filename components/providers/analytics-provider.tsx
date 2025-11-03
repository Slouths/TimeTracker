'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { initPostHog, posthog } from '@/lib/analytics/posthog-client'
import { trackPageView } from '@/lib/analytics/events'

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Initialize PostHog on mount
    initPostHog()
  }, [])

  useEffect(() => {
    // Track page views on route change
    if (pathname) {
      trackPageView(pathname)
    }
  }, [pathname, searchParams])

  return <>{children}</>
}
