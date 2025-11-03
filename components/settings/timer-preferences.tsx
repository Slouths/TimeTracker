'use client'

import {
  TIME_ROUNDING_OPTIONS,
  IDLE_TIMEOUT_OPTIONS,
} from '@/lib/user-settings'
import { RoundingOption } from '@/lib/time-utils'

interface TimerPreferencesProps {
  timeRounding: RoundingOption
  idleTimeout: number
  autoStartTimer: boolean
  onTimeRoundingChange: (value: RoundingOption) => void
  onIdleTimeoutChange: (value: number) => void
  onAutoStartTimerChange: (value: boolean) => void
}

export function TimerPreferences({
  timeRounding,
  idleTimeout,
  autoStartTimer,
  onTimeRoundingChange,
  onIdleTimeoutChange,
  onAutoStartTimerChange,
}: TimerPreferencesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
          Timer Preferences
        </h3>
      </div>

      {/* Time Rounding */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Rounding
        </label>
        <select
          value={timeRounding}
          onChange={(e) =>
            onTimeRoundingChange(e.target.value as RoundingOption)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
        >
          {TIME_ROUNDING_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Round tracked time to the nearest interval when timer stops
        </p>
      </div>

      {/* Idle Timeout */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Idle Timeout
        </label>
        <select
          value={idleTimeout}
          onChange={(e) => onIdleTimeoutChange(Number(e.target.value))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
        >
          {IDLE_TIMEOUT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Detect when you're idle and prompt to adjust tracked time
        </p>
      </div>

      {/* Auto-start Timer */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={autoStartTimer}
            onChange={(e) => onAutoStartTimerChange(e.target.checked)}
            className="w-4 h-4 mt-0.5 text-accent-primary focus:ring-accent-primary rounded"
          />
          <div>
            <div className="text-sm font-medium text-gray-700">
              Auto-start timer when client is selected
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Automatically start the timer when you select a client (instead
              of requiring a separate click)
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
