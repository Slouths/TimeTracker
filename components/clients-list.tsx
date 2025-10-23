'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  hourly_rate: number
}

interface ClientsListProps {
  userId: string
  refreshTrigger?: number
  onEditClient?: (client: Client) => void
}

export function ClientsList({
  userId,
  refreshTrigger = 0,
  onEditClient,
}: ClientsListProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function loadClients() {
      setLoading(true)
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('name')

      if (data) {
        setClients(data)
      }
      setLoading(false)
    }

    loadClients()
  }, [userId, refreshTrigger, supabase])

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This cannot be undone.`)) {
      return
    }

    setDeletingId(clientId)

    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) {
      console.error('Error deleting client:', error)
      alert('Failed to delete client. They may have existing time entries.')
    } else {
      // Remove from local state
      setClients((prev) => prev.filter((c) => c.id !== clientId))
    }

    setDeletingId(null)
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded-lg"></div>
            <div className="h-16 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-brand-charcoal mb-4">
          Your Clients
        </h3>
        <div className="text-center py-8 text-gray-500">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No clients yet.</p>
          <p className="text-sm mt-1">Add your first client to get started!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <h3 className="text-xl font-bold text-brand-charcoal mb-4">
        Your Clients <span className="text-brand-green">({clients.length})</span>
      </h3>

      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-ash-gray rounded-lg p-4 hover:bg-gray-100 transition-colors group"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-brand-charcoal">
                  {client.name}
                </h4>
                <p className="text-brand-green font-semibold">
                  ${client.hourly_rate.toFixed(2)}/hr
                </p>
                {(client.email || client.phone) && (
                  <div className="mt-2 text-sm text-gray-600">
                    {client.email && <p>{client.email}</p>}
                    {client.phone && <p>{client.phone}</p>}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEditClient?.(client)}
                  className="p-2 text-gray-500 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                  title="Edit client"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  disabled={deletingId === client.id}
                  className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Delete client"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
