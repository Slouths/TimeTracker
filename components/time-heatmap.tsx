'use client'

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

  // Helper to get color based on value (monochromatic slate scale)
  const getColor = (value: number) => {
    if (value === 0) return 'bg-slate-100'
    const intensity = value / maxValue
    if (intensity > 0.75) return 'bg-slate-950'
    if (intensity > 0.5) return 'bg-slate-700'
    if (intensity > 0.25) return 'bg-slate-500'
    return 'bg-slate-300'
  }

  // Working hours only (6 AM to 10 PM)
  const hours = Array.from({ length: 16 }, (_, i) => i + 6)

  return (
    <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-4">
        Activity Heatmap
      </h3>

      <p className="text-xs text-slate-600 mb-6">
        See when you're most productive. Darker colors indicate higher earnings.
      </p>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-2">
            <div className="w-16 flex-shrink-0"></div>
            <div className="flex gap-1">
              {hours.map((hour) => (
                <div key={hour} className="w-12 text-center text-xs text-slate-600">
                  {hour <= 12 ? `${hour}a` : `${hour - 12}p`}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-16 flex-shrink-0 text-xs font-semibold text-slate-700 uppercase tracking-wide">
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
                      className={`w-12 h-8 rounded ${color} flex items-center justify-center text-xs font-semibold transition-all hover:opacity-80 cursor-pointer border border-slate-200`}
                      title={`${day} ${hour}:00 - $${value.toFixed(2)}`}
                    >
                      {value > 0 && (
                        <span className="text-white drop-shadow font-mono text-xs">
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
            <span className="text-xs text-slate-600">Less</span>
            <div className="flex gap-1">
              <div className="w-5 h-5 rounded bg-slate-100 border border-slate-200"></div>
              <div className="w-5 h-5 rounded bg-slate-300 border border-slate-200"></div>
              <div className="w-5 h-5 rounded bg-slate-500 border border-slate-200"></div>
              <div className="w-5 h-5 rounded bg-slate-700 border border-slate-200"></div>
              <div className="w-5 h-5 rounded bg-slate-950 border border-slate-200"></div>
            </div>
            <span className="text-xs text-slate-600">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
