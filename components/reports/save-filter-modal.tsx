'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'
import { saveReportFilter } from '@/lib/report-filters'

interface SaveFilterModalProps {
  userId: string
  timePeriod: 'week' | 'month' | 'year' | 'all'
  startDate: string
  endDate: string
  selectedClients: string[]
  onClose: () => void
  onSaved: () => void
}

export function SaveFilterModal({
  userId,
  timePeriod,
  startDate,
  endDate,
  selectedClients,
  onClose,
  onSaved,
}: SaveFilterModalProps) {
  const [filterName, setFilterName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!filterName.trim()) {
      toast.warning('Please enter a filter name')
      return
    }

    setSaving(true)

    const success = await saveReportFilter(
      userId,
      filterName,
      timePeriod,
      startDate,
      endDate,
      selectedClients
    )

    if (success) {
      toast.success('Filter saved!', `"${filterName}" has been saved`)
      onSaved()
      onClose()
    } else {
      toast.error('Failed to save filter', 'Please try again')
    }

    setSaving(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-brand-charcoal">
            Save Current Filter
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter Name
          </label>
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="e.g., Q1 2024 Top Clients"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
            autoFocus
          />

          <div className="mt-4 p-3 bg-slate-50 rounded text-sm text-gray-600">
            <p className="font-medium mb-2">This filter will save:</p>
            <ul className="space-y-1 text-xs">
              <li>• Time period: <strong>{timePeriod}</strong></li>
              {startDate && <li>• Start date: <strong>{startDate}</strong></li>}
              {endDate && <li>• End date: <strong>{endDate}</strong></li>}
              <li>
                • Clients:{' '}
                <strong>
                  {selectedClients.length === 0
                    ? 'All'
                    : `${selectedClients.length} selected`}
                </strong>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-white rounded-md disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Filter'}
          </Button>
        </div>
      </div>
    </div>
  )
}
