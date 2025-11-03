/**
 * Time rounding utility functions for billable time tracking
 */

export type RoundingOption = 'none' | '15min' | '30min' | '1hour'

/**
 * Round time in minutes according to the specified rounding option.
 * Always rounds UP for billable time to ensure fair compensation.
 *
 * @param minutes - The number of minutes to round
 * @param roundingOption - The rounding option to apply
 * @returns The rounded number of minutes
 */
export function roundTime(minutes: number, roundingOption: RoundingOption): number {
  if (roundingOption === 'none' || minutes === 0) {
    return minutes
  }

  let roundingInterval: number

  switch (roundingOption) {
    case '15min':
      roundingInterval = 15
      break
    case '30min':
      roundingInterval = 30
      break
    case '1hour':
      roundingInterval = 60
      break
    default:
      return minutes
  }

  // Always round UP for billable time
  return Math.ceil(minutes / roundingInterval) * roundingInterval
}

/**
 * Format minutes into a human-readable duration string
 * @param minutes - The number of minutes
 * @returns Formatted string like "2h 30m" or "45m"
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
 * Format seconds into HH:MM:SS format
 * @param seconds - The number of seconds
 * @returns Formatted string like "02:30:45"
 */
export function formatTimeHMS(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

/**
 * Convert minutes to decimal hours
 * @param minutes - The number of minutes
 * @returns Decimal hours (e.g., 90 minutes = 1.5 hours)
 */
export function minutesToHours(minutes: number): number {
  return minutes / 60
}

/**
 * Convert decimal hours to minutes
 * @param hours - The number of hours
 * @returns Minutes (e.g., 1.5 hours = 90 minutes)
 */
export function hoursToMinutes(hours: number): number {
  return Math.round(hours * 60)
}

/**
 * Get rounding description for UI display
 * @param original - Original minutes
 * @param rounded - Rounded minutes
 * @param option - Rounding option used
 * @returns Description string for display
 */
export function getRoundingDescription(
  original: number,
  rounded: number,
  option: RoundingOption
): string | null {
  if (option === 'none' || original === rounded) {
    return null
  }

  return `${formatDuration(original)} → ${formatDuration(rounded)} (rounded to ${option})`
}

/**
 * Calculate the amount to charge based on duration and hourly rate
 * @param minutes - Duration in minutes
 * @param hourlyRate - Hourly rate
 * @returns Amount to charge
 */
export function calculateAmount(minutes: number, hourlyRate: number): number {
  return (minutes / 60) * hourlyRate
}
