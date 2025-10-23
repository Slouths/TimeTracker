'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function SetupBanner() {
  const [dismissed, setDismissed] = useState(false)

  // Check if Supabase is configured
  const isConfigured =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your-project-url'

  if (isConfigured || dismissed) {
    return null
  }

  return (
    <div className="bg-amber-500 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium">
            🚀 <strong>Setup Required:</strong> Supabase is not configured yet.
            <span className="ml-1">
              Check <code className="bg-amber-600 px-1 py-0.5 rounded">SETUP.md</code> for instructions.
            </span>
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="ml-4 text-white hover:text-amber-100 transition-colors"
          aria-label="Dismiss banner"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
