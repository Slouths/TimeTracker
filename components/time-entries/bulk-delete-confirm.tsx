'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BulkDeleteConfirmProps {
  count: number
  onConfirm: () => void
  onCancel: () => void
}

export function BulkDeleteConfirm({
  count,
  onConfirm,
  onCancel,
}: BulkDeleteConfirmProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-brand-charcoal">
            Delete Time Entries
          </h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{count}</strong> time{' '}
            {count === 1 ? 'entry' : 'entries'}?
          </p>
          <p className="text-sm text-error mt-2">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="px-4 py-2 bg-error hover:bg-error/90 text-white rounded-md"
          >
            Delete {count} {count === 1 ? 'Entry' : 'Entries'}
          </Button>
        </div>
      </div>
    </div>
  )
}
