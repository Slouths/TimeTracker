'use client'

import { Calendar } from 'lucide-react'

interface TimeEntry {
  id: string
  start_time: string
  end_time: string
  duration_minutes: number
  amount: number
}

interface TimeHeatmapProps {
  entries: TimeEntry[]
}

export function TimeHeatmap({ entries }: TimeHeatmapProps) {
  // Calculate earnings by day of week and hour
  const heatmapData = new Map<string, number>()
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  entries.forEach((entry) => {
    const startDate = new Date(entry.start_time)
    const dayOfWeek = startDate.getDay() // 0-6
    const hour = startDate.getHours() // 0-23
    const key = `${dayOfWeek}-${hour}`
    heatmapData.set(key, (heatmapData.get(key) || 0) + entry.amount)
  })

  // Find max value for color scaling
  const maxValue = Math.max(...Array.from(heatmapData.values()), 1)

  // Helper to get color based on value
  const getColor = (value: number) => {
    if (value === 0) return 'bg-gray-100'
    const intensity = value / maxValue
    if (intensity > 0.75) return 'bg-brand-green'
    if (intensity > 0.5) return 'bg-brand-sky'
    if (intensity > 0.25) return 'bg-brand-amber'
    return 'bg-orange-300'
  }

  // Working hours only (6 AM to 10 PM)
  const hours = Array.from({ length: 16 }, (_, i) => i + 6)

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="h-6 w-6 text-brand-green" />
        <h3 className="text-xl font-bold text-brand-charcoal">
          Activity Heatmap
        </h3>
      </div>

      <p className="text-sm text-gray-600 mb-6">
        See when you're most productive. Darker colors indicate higher earnings.
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-16 flex-shrink-0"></div>
            <div className="flex gap-1">
              {hours.map((hour) => (
                <div key={hour} className="w-12 text-center text-xs text-gray-600">
                  {hour <= 12 ? `${hour}a` : `${hour - 12}p`}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-16 flex-shrink-0 text-sm font-medium text-gray-700">
                {day}
              </div>
              <div className="flex gap-1">
                {hours.map((hour) => {
                  const key = `${dayIndex}-${hour}`
                  const value = heatmapData.get(key) || 0
                  const color = getColor(value)

                  return (
                    <div
                      key={hour}
                      className={`w-12 h-10 rounded ${color} flex items-center justify-center text-xs font-semibold transition-all hover:scale-105 cursor-pointer`}
                      title={`${day} ${hour}:00 - $${value.toFixed(2)}`}
                    >
                      {value > 0 && (
                        <span className="text-white drop-shadow">
                          ${value >= 100 ? value.toFixed(0) : value.toFixed(0)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <span className="text-sm text-gray-600">Less</span>
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded bg-gray-100"></div>
              <div className="w-6 h-6 rounded bg-orange-300"></div>
              <div className="w-6 h-6 rounded bg-brand-amber"></div>
              <div className="w-6 h-6 rounded bg-brand-sky"></div>
              <div className="w-6 h-6 rounded bg-brand-green"></div>
            </div>
            <span className="text-sm text-gray-600">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
