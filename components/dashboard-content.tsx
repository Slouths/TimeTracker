'use client'

import { useState, useEffect } from 'react'
import { Timer } from './timer'
import { AddClientForm } from './add-client-form'
import { TimeEntriesList } from './time-entries-list'
import { ClientsList } from './clients-list'
import { EditTimeEntryModal } from './edit-time-entry-modal'
import { AddTimeEntryModal } from './add-time-entry-modal'
import { OnboardingFlow } from './onboarding/onboarding-flow'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  const [isHelpBannerDismissed, setIsHelpBannerDismissed] = useState(false)
  const [isAddEntryModalOpen, setIsAddEntryModalOpen] = useState(false)

  // Load help banner dismissed state from localStorage
  useEffect(() => {
    const dismissed = localStorage.getItem('help-banner-dismissed')
    if (dismissed === 'true') {
      setIsHelpBannerDismissed(true)
    }
  }, [])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleDismissHelpBanner = () => {
    localStorage.setItem('help-banner-dismissed', 'true')
    setIsHelpBannerDismissed(true)
  }

  const handleShowHelpBanner = () => {
    localStorage.removeItem('help-banner-dismissed')
    setIsHelpBannerDismissed(false)
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
        <div className="flex-shrink-0 flex gap-3">
          <Button
            onClick={() => setIsAddEntryModalOpen(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded font-medium transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Time Entry
          </Button>
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
      {!isHelpBannerDismissed ? (
        <div className="bg-gradient-to-r from-brand-sky/10 to-brand-green/10 rounded-xl p-6 relative">
          <button
            onClick={handleDismissHelpBanner}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Dismiss help banner"
          >
            <X className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
            How to Use TradeTimer
          </h3>
          <ol className="text-gray-700 space-y-2 list-decimal list-inside pr-8">
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
      ) : (
        <div className="text-center">
          <button
            onClick={handleShowHelpBanner}
            className="text-sm text-gray-600 hover:text-accent-primary transition-colors underline"
          >
            Show Help
          </button>
        </div>
      )}

      {/* Edit Time Entry Modal */}
      <EditTimeEntryModal
        entry={editingEntry}
        userId={userId}
        onClose={handleCloseEntryEdit}
        onSaved={handleRefresh}
      />

      {/* Add Time Entry Modal */}
      <AddTimeEntryModal
        isOpen={isAddEntryModalOpen}
        onClose={() => setIsAddEntryModalOpen(false)}
        userId={userId}
        onSaved={handleRefresh}
      />
    </>
  )
}
