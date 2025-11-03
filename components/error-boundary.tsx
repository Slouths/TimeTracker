'use client'

import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export function ErrorBoundary({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h2 className="text-2xl font-bold text-slate-950 mb-4">Something went wrong</h2>
        <p className="text-slate-600 mb-6">
          We've been notified and will fix this as soon as possible.
        </p>
        <button
          onClick={reset}
          className="w-full bg-accent-primary text-white py-2 px-4 rounded-md hover:bg-accent-hover"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
