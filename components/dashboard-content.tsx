'use client'

import { useState } from 'react'
import { Timer } from './timer'
import { AddClientForm } from './add-client-form'
import { TimeEntriesList } from './time-entries-list'
import { ClientsList } from './clients-list'
import { EditTimeEntryModal } from './edit-time-entry-modal'
import { OnboardingFlow } from './onboarding/onboarding-flow'

interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  hourly_rate: number
}

interface TimeEntry {
  id: string
  client_id: string
  start_time: string
  end_time: string
  duration_minutes: number
  notes: string | null
  amount: number
  clients: {
    name: string
  }
}

interface DashboardContentProps {
  userId: string
}

export function DashboardContent({ userId }: DashboardContentProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null)

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
  }

  const handleCancelEdit = () => {
    setEditingClient(null)
  }

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry)
  }

  const handleCloseEntryEdit = () => {
    setEditingEntry(null)
  }

  return (
    <>
      {/* Onboarding Flow */}
      <OnboardingFlow userId={userId} onComplete={handleRefresh} />

      {/* Dashboard Header with Add Client Button */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">
            Dashboard
          </h1>
          <p className="text-gray-600">
            Track time, manage clients, and get paid faster
          </p>
        </div>
        <div className="flex-shrink-0">
          <AddClientForm
            userId={userId}
            onClientAdded={handleRefresh}
            editingClient={editingClient}
            onCancelEdit={handleCancelEdit}
          />
        </div>
      </div>

      {/* Primary Action - Centered Timer */}
      <div className="flex justify-center mb-16">
        <div className="w-full max-w-3xl">
          <Timer
            userId={userId}
            onTimeEntrySaved={handleRefresh}
            refreshTrigger={refreshTrigger}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 mb-12"></div>

      {/* Clients List */}
      <div className="mb-8">
        <ClientsList
          userId={userId}
          refreshTrigger={refreshTrigger}
          onEditClient={handleEditClient}
        />
      </div>

      {/* Recent Time Entries */}
      <div className="mb-10">
        <TimeEntriesList
          userId={userId}
          refreshTrigger={refreshTrigger}
          onEditEntry={handleEditEntry}
        />
      </div>

      {/* Help Banner */}
      <div className="bg-gradient-to-r from-brand-sky/10 to-brand-green/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
          How to Use TradeTimer
        </h3>
        <ol className="text-gray-700 space-y-2 list-decimal list-inside">
          <li>
            <strong>Add a client</strong> - Click &quot;Add New Client&quot; to set up your first client with their hourly rate
          </li>
          <li>
            <strong>Start tracking</strong> - Select a client from the dropdown and click &quot;START WORK&quot;
          </li>
          <li>
            <strong>Stop when done</strong> - Click &quot;STOP WORK&quot; to save the entry and see your earnings
          </li>
          <li>
            <strong>View history</strong> - All your time entries are saved below with amounts calculated
          </li>
        </ol>
      </div>

      {/* Edit Time Entry Modal */}
      <EditTimeEntryModal
        entry={editingEntry}
        userId={userId}
        onClose={handleCloseEntryEdit}
        onSaved={handleRefresh}
      />
    </>
  )
}
