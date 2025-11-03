'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'

interface Client {
  id: string
  name: string
}

interface BulkEditModalProps {
  selectedIds: string[]
  userId: string
  onClose: () => void
  onSaved: () => void
}

export function BulkEditModal({
  selectedIds,
  userId,
  onClose,
  onSaved,
}: BulkEditModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [adjustmentType, setAdjustmentType] = useState<'none' | 'percentage' | 'fixed'>('none')
  const [adjustmentValue, setAdjustmentValue] = useState<string>('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', userId)
        .order('name')

      if (data) {
        setClients(data)
      }
    }
    loadClients()
  }, [userId, supabase])

  const handleSave = async () => {
    if (!selectedClientId && adjustmentType === 'none') {
      toast.warning('No changes to apply', 'Please select a client or rate adjustment')
      return
    }

    setSaving(true)

    try {
      // First, get all selected entries to calculate new amounts
      const { data: entries } = await supabase
        .from('time_entries')
        .select('id, amount, duration_minutes, client_id')
        .in('id', selectedIds)

      if (!entries) {
        throw new Error('Failed to load entries')
      }

      // Update each entry
      for (const entry of entries) {
        let newAmount = entry.amount
        let newClientId = entry.client_id

        // Apply rate adjustment
        if (adjustmentType === 'percentage' && adjustmentValue) {
          const percentage = parseFloat(adjustmentValue)
          newAmount = entry.amount * (1 + percentage / 100)
        } else if (adjustmentType === 'fixed' && adjustmentValue) {
          const fixedChange = parseFloat(adjustmentValue)
          newAmount = Math.max(0, entry.amount + fixedChange)
        }

        // Apply client change
        if (selectedClientId) {
          newClientId = selectedClientId
        }

        // Update the entry
        const { error } = await supabase
          .from('time_entries')
          .update({
            client_id: newClientId,
            amount: newAmount,
          })
          .eq('id', entry.id)

        if (error) {
          throw error
        }
      }

      toast.success('Bulk update complete', `Updated ${selectedIds.length} entries`)
      onSaved()
      onClose()
    } catch (error) {
      console.error('Error updating entries:', error)
      toast.error('Failed to update entries', 'Please try again')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-brand-charcoal">
            Bulk Edit {selectedIds.length} Entries
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Client (optional)
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-primary"
            >
              <option value="">Keep current clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Rate Adjustment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Adjustment (optional)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="no-adjustment"
                  checked={adjustmentType === 'none'}
                  onChange={() => setAdjustmentType('none')}
                  className="rounded"
                />
                <label htmlFor="no-adjustment" className="text-sm text-gray-700">
                  No adjustment
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="percentage"
                  checked={adjustmentType === 'percentage'}
                  onChange={() => setAdjustmentType('percentage')}
                  className="rounded"
                />
                <label htmlFor="percentage" className="text-sm text-gray-700">
                  Percentage change
                </label>
                {adjustmentType === 'percentage' && (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(e.target.value)}
                      placeholder="10"
                      step="0.1"
                      className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="fixed"
                  checked={adjustmentType === 'fixed'}
                  onChange={() => setAdjustmentType('fixed')}
                  className="rounded"
                />
                <label htmlFor="fixed" className="text-sm text-gray-700">
                  Fixed amount change
                </label>
                {adjustmentType === 'fixed' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">$</span>
                    <input
                      type="number"
                      value={adjustmentValue}
                      onChange={(e) => setAdjustmentValue(e.target.value)}
                      placeholder="10.00"
                      step="0.01"
                      className="w-24 px-3 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {adjustmentType === 'percentage' && adjustmentValue && (
              <p className="text-xs text-gray-500 mt-2">
                Example: 10% increase will change $100 to $110
              </p>
            )}
            {adjustmentType === 'fixed' && adjustmentValue && (
              <p className="text-xs text-gray-500 mt-2">
                Example: +$10 will change $100 to $110
              </p>
            )}
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
            {saving ? 'Saving...' : 'Apply Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}
