'use client'

import { ReactNode, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  icon: ReactNode
  label: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percentage'
  iconColor?: 'green' | 'blue' | 'orange' | 'purple'
  decimals?: number
  onClick?: () => void
  loading?: boolean
}

export function MetricCard({
  icon,
  label,
  value,
  previousValue,
  format = 'number',
  iconColor = 'green',
  decimals = 2,
  onClick,
  loading = false,
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  // Animated counting effect
  useEffect(() => {
    if (loading) return

    const duration = 1000 // 1 second
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, loading])

  const formatValue = (val: number): string => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(val)
      case 'percentage':
        return `${val.toFixed(decimals)}%`
      default:
        return val.toFixed(decimals)
    }
  }

  const calculateChange = (): { percentage: number; isPositive: boolean } | null => {
    if (previousValue === undefined || previousValue === 0) return null

    const change = ((value - previousValue) / previousValue) * 100
    return {
      percentage: Math.abs(change),
      isPositive: change >= 0,
    }
  }

  const change = calculateChange()

  const iconColors = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-xl p-6 shadow-sm transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''
      }`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColors[iconColor]}`}>
          {icon}
        </div>
      </div>

      {/* Label */}
      <p className="text-sm text-gray-600 mb-1">{label}</p>

      {/* Value */}
      <p className="text-3xl font-bold text-gray-900 mb-2">
        {formatValue(displayValue)}
      </p>

      {/* Change Indicator */}
      {change && (
        <div className="flex items-center gap-1">
          {change.isPositive ? (
            <>
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-600">
                +{change.percentage.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-600">
                -{change.percentage.toFixed(1)}%
              </span>
            </>
          )}
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      )}

      {!change && <div className="h-5"></div>}
    </motion.div>
  )
}
