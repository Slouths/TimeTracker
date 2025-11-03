'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, X } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  options: Option[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  label?: string
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select items',
  label,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function toggleOption(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  function selectAll() {
    onChange(options.map((o) => o.value))
  }

  function clearAll() {
    onChange([])
  }

  const selectedLabels = options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label)

  return (
    <div ref={dropdownRef} className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 py-2 text-left focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
      >
        <span className="truncate text-sm">
          {selected.length === 0
            ? placeholder
            : selected.length === options.length
            ? 'All selected'
            : `${selected.length} selected`}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-sky-600 hover:text-sky-700"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={clearAll}
              className="text-xs font-medium text-gray-600 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            {options.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center px-3 py-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option.value)}
                  onChange={() => toggleOption(option.value)}
                  className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                />
                <span className="ml-3 text-sm text-gray-900">{option.label}</span>
              </label>
            ))}
          </div>

          {selected.length > 0 && (
            <div className="border-t border-gray-200 px-3 py-2">
              <div className="text-xs text-gray-500 mb-1">Selected:</div>
              <div className="flex flex-wrap gap-1">
                {selectedLabels.map((label, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 text-xs text-sky-800"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
