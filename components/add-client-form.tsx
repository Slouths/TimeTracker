'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  hourly_rate: number
}

interface AddClientFormProps {
  userId: string
  onClientAdded?: () => void
  editingClient?: Client | null
  onCancelEdit?: () => void
}

export function AddClientForm({
  userId,
  onClientAdded,
  editingClient = null,
  onCancelEdit
}: AddClientFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [hourlyRate, setHourlyRate] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  // Populate form when editing
  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name)
      setEmail(editingClient.email || '')
      setPhone(editingClient.phone || '')
      setHourlyRate(editingClient.hourly_rate.toString())
      setIsOpen(true)
    }
  }, [editingClient])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (editingClient) {
      // Update existing client
      const { error } = await supabase
        .from('clients')
        .update({
          name,
          email: email || null,
          phone: phone || null,
          hourly_rate: parseFloat(hourlyRate),
        })
        .eq('id', editingClient.id)

      if (error) {
        console.error('Error updating client:', error)
        alert('Failed to update client')
      } else {
        // Reset form
        resetForm()

        // Notify parent
        if (onCancelEdit) {
          onCancelEdit()
        }
        if (onClientAdded) {
          onClientAdded()
        }
      }
    } else {
      // Insert new client
      const { error } = await supabase.from('clients').insert({
        user_id: userId,
        name,
        email: email || null,
        phone: phone || null,
        hourly_rate: parseFloat(hourlyRate),
      })

      if (error) {
        console.error('Error adding client:', error)
        alert('Failed to add client')
      } else {
        // Reset form
        resetForm()

        // Notify parent
        if (onClientAdded) {
          onClientAdded()
        }
      }
    }

    setLoading(false)
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setHourlyRate('')
    setIsOpen(false)
  }

  const handleCancel = () => {
    resetForm()
    if (onCancelEdit) {
      onCancelEdit()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="text-brand-green hover:text-brand-green/80 font-semibold transition-colors text-lg"
      >
        Add New Client
      </button>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-5 border border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-brand-charcoal">
          {editingClient ? 'Edit Client' : 'Add New Client'}
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-brand-charcoal transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-brand-charcoal mb-1"
          >
            Client Name *
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John's Construction"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="hourly-rate"
            className="block text-sm font-medium text-brand-charcoal mb-1"
          >
            Hourly Rate ($) *
          </label>
          <input
            id="hourly-rate"
            type="number"
            required
            step="0.01"
            min="0"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="75.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-brand-charcoal mb-1"
          >
            Email (optional)
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@construction.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-brand-charcoal mb-1"
          >
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 123-4567"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1 bg-brand-green hover:bg-brand-green/90 text-white"
          >
            {loading
              ? editingClient
                ? 'Updating...'
                : 'Adding...'
              : editingClient
              ? 'Update Client'
              : 'Add Client'}
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
