'use client'

import { useState, useEffect } from 'react'
import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { createProject, updateProject, ProjectWithClient } from '@/lib/projects'
import { toast } from 'sonner'
import { sanitizeInput } from '@/lib/sanitize'
import { trackEvent } from '@/lib/analytics/events'

interface Client {
  id: string
  name: string
}

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editingProject?: ProjectWithClient | null
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onSuccess,
  editingProject,
}: AddProjectModalProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    description: '',
    budget: '',
    status: 'active' as 'active' | 'completed' | 'archived',
  })

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadClients()
      if (editingProject) {
        setFormData({
          client_id: editingProject.client_id,
          name: editingProject.name,
          description: editingProject.description || '',
          budget: editingProject.budget?.toString() || '',
          status: editingProject.status,
        })
      } else {
        setFormData({
          client_id: '',
          name: '',
          description: '',
          budget: '',
          status: 'active',
        })
      }
    }
  }, [isOpen, editingProject])

  async function loadClients() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('clients')
      .select('id, name')
      .eq('user_id', user.id)
      .order('name')

    if (error) {
      console.error('Error loading clients:', error)
      return
    }

    setClients(data || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in')
      setLoading(false)
      return
    }

    // Validate
    if (!formData.client_id || !formData.name.trim()) {
      toast.error('Please fill in all required fields')
      setLoading(false)
      return
    }

    // Sanitize inputs
    const sanitizedData = {
      client_id: formData.client_id,
      name: sanitizeInput(formData.name.trim()),
      description: formData.description.trim() ? sanitizeInput(formData.description.trim()) : null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      status: formData.status,
    }

    if (editingProject) {
      // Update existing project
      const result = await updateProject(supabase, editingProject.id, sanitizedData)

      if (result) {
        toast.success('Project updated successfully')
        trackEvent('project_updated')
        onSuccess()
        onClose()
      } else {
        toast.error('Failed to update project')
      }
    } else {
      // Create new project
      const result = await createProject(supabase, user.id, sanitizedData)

      if (result) {
        toast.success('Project created successfully')
        trackEvent('project_created', { client_id: sanitizedData.client_id })
        onSuccess()
        onClose()
      } else {
        toast.error('Failed to create project')
      }
    }

    setLoading(false)
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              {editingProject ? 'Edit Project' : 'Add Project'}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="client"
                value={formData.client_id}
                onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                required
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Website Redesign"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                placeholder="Brief description of the project"
              />
            </div>

            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700">
                Budget (optional)
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  id="budget"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="block w-full rounded-lg border border-gray-300 py-2 pl-7 pr-3 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  placeholder="5000.00"
                  step="0.01"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'active' | 'completed' | 'archived',
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
