import { UserSettings } from './user-settings'

/**
 * Format a date according to user settings
 */
export function formatDate(date: Date | string, settings: UserSettings): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  const month = dateObj.getMonth() + 1
  const day = dateObj.getDate()
  const year = dateObj.getFullYear()

  const monthStr = month.toString().padStart(2, '0')
  const dayStr = day.toString().padStart(2, '0')
  const yearStr = year.toString()

  switch (settings.date_format) {
    case 'MM/DD/YYYY':
      return `${monthStr}/${dayStr}/${yearStr}`
    case 'DD/MM/YYYY':
      return `${dayStr}/${monthStr}/${yearStr}`
    case 'YYYY-MM-DD':
      return `${yearStr}-${monthStr}-${dayStr}`
    default:
      return `${monthStr}/${dayStr}/${yearStr}`
  }
}

/**
 * Format a time according to user settings
 */
export function formatTime(date: Date | string, settings: UserSettings): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  let hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()

  if (settings.time_format === '12h') {
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // the hour '0' should be '12'
    const minutesStr = minutes.toString().padStart(2, '0')
    return `${hours}:${minutesStr} ${ampm}`
  } else {
    // 24h format
    const hoursStr = hours.toString().padStart(2, '0')
    const minutesStr = minutes.toString().padStart(2, '0')
    return `${hoursStr}:${minutesStr}`
  }
}

/**
 * Format a datetime according to user settings
 */
export function formatDateTime(
  date: Date | string,
  settings: UserSettings
): string {
  return `${formatDate(date, settings)} ${formatTime(date, settings)}`
}

/**
 * Format currency according to user settings
 */
export function formatCurrency(
  amount: number,
  settings: UserSettings
): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
  }

  const symbol = currencySymbols[settings.currency] || '$'

  // For JPY, don't show decimal places
  if (settings.currency === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`
  }

  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Format duration in minutes to human-readable format
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  if (hours > 0) {
    return `${hours}h ${mins}m`
  }
  return `${mins}m`
}

/**
 * Format duration in seconds to HH:MM:SS
 */
export function formatDurationHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get short date format for display
 */
export function formatShortDate(
  date: Date | string,
  settings?: UserSettings
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  if (!settings) {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return formatDate(dateObj, settings)
}
