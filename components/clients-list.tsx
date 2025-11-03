'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast, confirm } from '@/lib/toast'

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
    confirm(
      `Delete "${clientName}"? This cannot be undone.`,
      async () => {
        setDeletingId(clientId)

        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', clientId)

        if (error) {
          console.error('Error deleting client:', error)
          toast.error('Failed to delete client', 'They may have existing time entries.')
        } else {
          // Remove from local state
          setClients((prev) => prev.filter((c) => c.id !== clientId))
          toast.success('Client deleted', `${clientName} has been removed`)
        }

        setDeletingId(null)
      }
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-slate-100 rounded"></div>
            <div className="h-16 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-4">
          Clients
        </h3>
        <div className="text-center py-12 px-4">
          <p className="text-sm text-slate-600">No clients yet</p>
          <p className="text-xs text-slate-500 mt-2">
            Add your first client to start tracking time
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-md shadow-md p-6 border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-950 uppercase tracking-wide mb-4">
        Clients ({clients.length})
      </h3>

      <div className="space-y-3">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-slate-50 rounded border border-slate-200 p-3 hover:bg-slate-100 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-950 text-sm">
                  {client.name}
                </h4>
                <p className="text-slate-950 font-semibold font-mono text-sm">
                  ${client.hourly_rate.toFixed(2)}/hr
                </p>
                {(client.email || client.phone) && (
                  <div className="mt-2 text-xs text-slate-600">
                    {client.email && <p>{client.email}</p>}
                    {client.phone && <p>{client.phone}</p>}
                  </div>
                )}
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => onEditClient?.(client)}
                  className="p-1.5 text-slate-500 hover:text-accent-primary hover:bg-accent-primary/10 rounded transition-colors"
                  title="Edit client"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(client.id, client.name)}
                  disabled={deletingId === client.id}
                  className="p-1.5 text-slate-500 hover:text-error hover:bg-error/10 rounded transition-colors disabled:opacity-50"
                  title="Delete client"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
