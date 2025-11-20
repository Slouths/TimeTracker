'use client'

import { useState, useEffect, InputHTMLAttributes } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface ValidatedNumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label: string
  name: string
  value: string | number
  onChange: (value: string) => void
  min?: number
  max?: number
  step?: number
  prefix?: string
  suffix?: string
  errorMessages?: {
    required?: string
    min?: string
    max?: string
    invalid?: string
  }
  required?: boolean
  showValidIcon?: boolean
}

export function ValidatedNumberInput({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 0.01,
  prefix,
  suffix,
  errorMessages = {},
  required = false,
  showValidIcon = true,
  className = '',
  ...props
}: ValidatedNumberInputProps) {
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!touched) return

    const timer = setTimeout(() => {
      validateField(value.toString())
    }, 300)

    return () => clearTimeout(timer)
  }, [value, touched])

  const validateField = (val: string) => {
    // Required check
    if (required && !val.trim()) {
      setError(errorMessages.required || 'This field is required')
      setIsValid(false)
      return
    }

    // If not required and empty, it's valid
    if (!required && !val.trim()) {
      setError(null)
      setIsValid(true)
      return
    }

    // Check if valid number
    const num = parseFloat(val)
    if (isNaN(num)) {
      setError(errorMessages.invalid || 'Please enter a valid number')
      setIsValid(false)
      return
    }

    // Min check
    if (min !== undefined && num < min) {
      setError(errorMessages.min || `Minimum value is ${min}`)
      setIsValid(false)
      return
    }

    // Max check
    if (max !== undefined && num > max) {
      setError(errorMessages.max || `Maximum value is ${max}`)
      setIsValid(false)
      return
    }

    setError(null)
    setIsValid(true)
  }

  const handleBlur = () => {
    setTouched(true)
    validateField(value.toString())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const getBorderColor = () => {
    if (!touched) return 'border-gray-300'
    if (error) return 'border-red-500'
    if (isValid && value.toString().trim()) return 'border-green-500'
    return 'border-gray-300'
  }

  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      <div className="relative">
        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-3 text-gray-500 pointer-events-none">
              {prefix}
            </span>
          )}

          <input
            id={name}
            name={name}
            type="number"
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            min={min}
            max={max}
            step={step}
            className={`w-full ${prefix ? 'pl-8' : 'pl-3'} ${
              suffix ? 'pr-16' : 'pr-10'
            } py-2 border ${getBorderColor()} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green transition-colors`}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            {...props}
          />

          {suffix && (
            <span className="absolute right-10 text-gray-500 pointer-events-none">
              {suffix}
            </span>
          )}

          {/* Validation Icon */}
          {touched && showValidIcon && (
            <div className="absolute right-3">
              {error ? (
                <XCircle className="h-5 w-5 text-red-500" aria-label="Invalid" />
              ) : isValid && value.toString().trim() ? (
                <CheckCircle className="h-5 w-5 text-green-500" aria-label="Valid" />
              ) : null}
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {touched && error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
