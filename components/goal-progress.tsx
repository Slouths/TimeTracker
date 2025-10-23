'use client'

import { useState, useEffect } from 'react'
import { Target, Edit2 } from 'lucide-react'
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
    if (progress >= 100) return '#10b981' // green
    if (progress >= 75) return '#219ebc' // brand-sky
    if (progress >= 50) return '#f59e0b' // amber
    return '#ef4444' // red
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
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="90"
            cy="90"
            r={radius}
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
          {/* Percentage text */}
          <text
            x="90"
            y="90"
            textAnchor="middle"
            dy="-10"
            className="text-3xl font-bold fill-brand-charcoal transform rotate-90"
            style={{ transformOrigin: '90px 90px' }}
          >
            {progress.toFixed(0)}%
          </text>
          <text
            x="90"
            y="90"
            textAnchor="middle"
            dy="15"
            className="text-sm fill-gray-600 transform rotate-90"
            style={{ transformOrigin: '90px 90px' }}
          >
            {label}
          </text>
        </svg>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {current.toFixed(unit === '$' ? 2 : 1)}{unit === '$' ? '' : 'h'} / {goal.toFixed(0)}{unit === '$' ? '' : 'h'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {unit === '$' ? `$${(goal - current).toFixed(2)} to go` : `${(goal - current).toFixed(1)}h to go`}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-brand-green" />
          <h3 className="text-xl font-bold text-brand-charcoal">
            Goal Progress
          </h3>
        </div>
        <Button
          onClick={() => {
            setTempEarningsGoal(earningsGoal)
            setTempHoursGoal(hoursGoal)
            setShowEditModal(true)
          }}
          variant="outline"
          size="sm"
          className="text-gray-600"
        >
          <Edit2 className="h-4 w-4 mr-2" />
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
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-brand-charcoal mb-6">
              Set Your Goals
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2">
                  Monthly Earnings Goal
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    value={tempEarningsGoal}
                    onChange={(e) => setTempEarningsGoal(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    min="0"
                    step="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2">
                  Monthly Hours Goal
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={tempHoursGoal}
                    onChange={(e) => setTempHoursGoal(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    min="0"
                    step="10"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">hours</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveGoals}
                className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
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
