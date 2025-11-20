'use client'

import { useState, useEffect, TextareaHTMLAttributes } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

type ValidationRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
}

type ErrorMessages = {
  required?: string
  minLength?: string
  maxLength?: string
}

interface ValidatedTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  validation?: ValidationRule
  errorMessages?: ErrorMessages
  showValidIcon?: boolean
  showCharCount?: boolean
}

export function ValidatedTextarea({
  label,
  name,
  value,
  onChange,
  validation,
  errorMessages = {},
  showValidIcon = true,
  showCharCount = false,
  className = '',
  ...props
}: ValidatedTextareaProps) {
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!touched) return

    const timer = setTimeout(() => {
      validateField(value)
    }, 300)

    return () => clearTimeout(timer)
  }, [value, touched])

  const validateField = (val: string) => {
    if (!validation) {
      setIsValid(true)
      setError(null)
      return
    }

    // Required check
    if (validation.required && !val.trim()) {
      setError(errorMessages.required || 'This field is required')
      setIsValid(false)
      return
    }

    // If not required and empty, it's valid
    if (!validation.required && !val.trim()) {
      setError(null)
      setIsValid(true)
      return
    }

    // Min length check
    if (validation.minLength && val.length < validation.minLength) {
      setError(errorMessages.minLength || `Minimum ${validation.minLength} characters required`)
      setIsValid(false)
      return
    }

    // Max length check
    if (validation.maxLength && val.length > validation.maxLength) {
      setError(errorMessages.maxLength || `Maximum ${validation.maxLength} characters allowed`)
      setIsValid(false)
      return
    }

    setError(null)
    setIsValid(true)
  }

  const handleBlur = () => {
    setTouched(true)
    validateField(value)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }

  const getBorderColor = () => {
    if (!touched) return 'border-gray-300'
    if (error) return 'border-red-500'
    if (isValid && value.trim()) return 'border-green-500'
    return 'border-gray-300'
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
          {validation?.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {showCharCount && validation?.maxLength && (
          <span className={`text-xs ${value.length > validation.maxLength ? 'text-red-600' : 'text-gray-500'}`}>
            {value.length}/{validation.maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full px-3 py-2 border ${getBorderColor()} rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green transition-colors resize-none`}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />

        {/* Validation Icon */}
        {touched && showValidIcon && (
          <div className="absolute right-3 top-3">
            {error ? (
              <XCircle className="h-5 w-5 text-red-500" aria-label="Invalid" />
            ) : isValid && value.trim() ? (
              <CheckCircle className="h-5 w-5 text-green-500" aria-label="Valid" />
            ) : null}
          </div>
        )}
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
