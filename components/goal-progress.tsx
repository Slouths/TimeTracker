'use client'

import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import { Button } from './ui/button'

interface GoalProgressProps {
  currentEarnings: number
  currentHours: number
  period: string
}

export function GoalProgress({ currentEarnings, currentHours, period }: GoalProgressProps) {
  const [earningsGoal, setEarningsGoal] = useState(5000)
  const [hoursGoal, setHoursGoal] = useState(160)
  const [showEditModal, setShowEditModal] = useState(false)
  const [tempEarningsGoal, setTempEarningsGoal] = useState(earningsGoal)
  const [tempHoursGoal, setTempHoursGoal] = useState(hoursGoal)

  // Load goals from localStorage
  useEffect(() => {
    const savedEarningsGoal = localStorage.getItem('earningsGoal')
    const savedHoursGoal = localStorage.getItem('hoursGoal')
    if (savedEarningsGoal) setEarningsGoal(Number(savedEarningsGoal))
    if (savedHoursGoal) setHoursGoal(Number(savedHoursGoal))
  }, [])

  const saveGoals = () => {
    setEarningsGoal(tempEarningsGoal)
    setHoursGoal(tempHoursGoal)
    localStorage.setItem('earningsGoal', tempEarningsGoal.toString())
    localStorage.setItem('hoursGoal', tempHoursGoal.toString())
    setShowEditModal(false)
  }

  const earningsProgress = Math.min((currentEarnings / earningsGoal) * 100, 100)
  const hoursProgress = Math.min((currentHours / hoursGoal) * 100, 100)

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return '#047857' // success
    if (progress >= 75) return '#334155' // slate-800
    if (progress >= 50) return '#c2410c' // warning
    return '#b91c1c' // error
  }

  const CircularProgress = ({ progress, color, label, current, goal, unit }: {
    progress: number
    color: string
    label: string
    current: number
    goal: number
    unit: string
  }) => {
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (progress / 100) * circumference

    return (
      <div className="flex flex-col items-center">
        <svg width="180" height="180" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke="#e2e8f0"
            strokeWidth="10"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={color}
            strokeWidth="10"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          {/* Percentage text */}
          <text
            x="90"
            y="90"
            textAnchor="middle"
            dy="-10"
            className="text-3xl font-bold fill-slate-950 transform rotate-90 font-mono"
            style={{ transformOrigin: '90px 90px' }}
          >
            {progress.toFixed(0)}%
          </text>
          <text
            x="90"
            y="90"
            textAnchor="middle"
            dy="15"
            className="text-xs fill-slate-600 transform rotate-90 uppercase tracking-wide"
            style={{ transformOrigin: '90px 90px' }}
          >
            {label}
          </text>
        </svg>
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600 font-mono">
            {current.toFixed(unit === '$' ? 2 : 1)}{unit === '$' ? '' : 'h'} / {goal.toFixed(0)}{unit === '$' ? '' : 'h'}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {unit === '$' ? `$${(goal - current).toFixed(2)} to go` : `${(goal - current).toFixed(1)}h to go`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide">
          Goal Progress
        </h3>
        <Button
          onClick={() => {
            setTempEarningsGoal(earningsGoal)
            setTempHoursGoal(hoursGoal)
            setShowEditModal(true)
          }}
          variant="outline"
          size="sm"
          className="text-slate-600 border-slate-300 hover:bg-slate-50 text-xs uppercase tracking-wide"
        >
          <Pencil className="h-3 w-3 mr-1.5" />
          Edit Goals
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <CircularProgress
          progress={earningsProgress}
          color={getProgressColor(earningsProgress)}
          label="Earnings"
          current={currentEarnings}
          goal={earningsGoal}
          unit="$"
        />
        <CircularProgress
          progress={hoursProgress}
          color={getProgressColor(hoursProgress)}
          label="Hours"
          current={currentHours}
          goal={hoursGoal}
          unit="h"
        />
      </div>

      {/* Edit Goals Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md shadow-md p-8 max-w-md w-full border border-slate-200">
            <h3 className="text-xl font-bold text-slate-950 mb-6 uppercase tracking-wide">
              Set Your Goals
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Monthly Earnings Goal
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                  <input
                    type="number"
                    value={tempEarningsGoal}
                    onChange={(e) => setTempEarningsGoal(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent font-mono"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Monthly Hours Goal
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tempHoursGoal}
                    onChange={(e) => setTempHoursGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent font-mono"
                    min="0"
                    step="10"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 text-sm">hours</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Button>
              <Button
                onClick={saveGoals}
                className="flex-1 bg-accent-primary hover:bg-accent-primary/90 text-white"
              >
                Save Goals
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
