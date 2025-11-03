'use client'

import {
  TIMEZONE_OPTIONS,
  DATE_FORMAT_OPTIONS,
  TIME_FORMAT_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/lib/user-settings'

interface DisplayPreferencesProps {
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  currency: string
  onTimezoneChange: (value: string) => void
  onDateFormatChange: (value: string) => void
  onTimeFormatChange: (value: '12h' | '24h') => void
  onCurrencyChange: (value: string) => void
}

export function DisplayPreferences({
  timezone,
  dateFormat,
  timeFormat,
  currency,
  onTimezoneChange,
  onDateFormatChange,
  onTimeFormatChange,
  onCurrencyChange,
}: DisplayPreferencesProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-brand-charcoal mb-4">
          Display Preferences
        </h3>
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          value={timezone}
          onChange={(e) => onTimezoneChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
        >
          {TIMEZONE_OPTIONS.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Your preferred timezone for displaying dates and times
        </p>
      </div>

      {/* Date Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date Format
        </label>
        <div className="space-y-2">
          {DATE_FORMAT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="dateFormat"
                value={option.value}
                checked={dateFormat === option.value}
                onChange={(e) => onDateFormatChange(e.target.value)}
                className="w-4 h-4 text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Example: {new Date().toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Time Format */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time Format
        </label>
        <div className="space-y-2">
          {TIME_FORMAT_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="timeFormat"
                value={option.value}
                checked={timeFormat === option.value}
                onChange={(e) =>
                  onTimeFormatChange(e.target.value as '12h' | '24h')
                }
                className="w-4 h-4 text-accent-primary focus:ring-accent-primary"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Example: {new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Currency */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
        <select
          value={currency}
          onChange={(e) => onCurrencyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent"
        >
          {CURRENCY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Currency used for displaying earnings and invoices
        </p>
      </div>
    </div>
  )
}
