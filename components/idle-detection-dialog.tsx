'use client'

import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

interface IdleDetectionDialogProps {
  isOpen: boolean
  idleMinutes: number
  onKeepAllTime: () => void
  onRemoveIdleTime: () => void
  onStopTimer: () => void
}

export function IdleDetectionDialog({
  isOpen,
  idleMinutes,
  onKeepAllTime,
  onRemoveIdleTime,
  onStopTimer,
}: IdleDetectionDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-md shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Idle Time Detected</h2>
              <p className="text-sm text-slate-600 mt-1">
                You&apos;ve been idle for {idleMinutes} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-slate-700 mb-6">
            What would you like to do with the idle time?
          </p>

          <div className="space-y-3">
            <Button
              onClick={onKeepAllTime}
              className="w-full bg-slate-700 hover:bg-slate-800 text-white py-3 rounded font-medium transition-colors text-sm justify-start"
            >
              <div className="text-left">
                <div className="font-semibold">Keep All Time</div>
                <div className="text-xs text-slate-300 mt-0.5">
                  Continue tracking with idle time included
                </div>
              </div>
            </Button>

            <Button
              onClick={onRemoveIdleTime}
              className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3 rounded font-medium transition-colors text-sm justify-start"
            >
              <div className="text-left">
                <div className="font-semibold">Remove Idle Time</div>
                <div className="text-xs text-white/80 mt-0.5">
                  Subtract the last {idleMinutes} minutes from tracked time
                </div>
              </div>
            </Button>

            <Button
              onClick={onStopTimer}
              className="w-full bg-error hover:bg-error/90 text-white py-3 rounded font-medium transition-colors text-sm justify-start"
            >
              <div className="text-left">
                <div className="font-semibold">Stop Timer</div>
                <div className="text-xs text-white/80 mt-0.5">
                  Stop tracking and save with idle time removed
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
