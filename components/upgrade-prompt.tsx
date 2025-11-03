'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  feature?: string
}

export function UpgradePrompt({
  isOpen,
  onClose,
  title,
  message,
  feature,
}: UpgradePromptProps) {
  if (!isOpen) return null

  const handleUpgrade = () => {
    window.location.href = '/subscription'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-accent-primary/10 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🚀</span>
          </div>
          <h2 className="text-2xl font-bold text-brand-charcoal mb-2">
            {title}
          </h2>
          <p className="text-gray-600">
            {message}
          </p>
        </div>

        {feature && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Pro Feature:</strong> {feature}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="font-semibold text-brand-charcoal text-sm uppercase tracking-wide mb-3">
            Pro Plan includes:
          </h3>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Unlimited clients</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Unlimited time entries</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Project tracking</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Advanced analytics</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>PDF export</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-gray-700">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Priority support</span>
            </li>
          </ul>

          <Button
            onClick={handleUpgrade}
            className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3 rounded-md font-semibold"
          >
            Upgrade to Pro - $15/month
          </Button>

          <Button
            onClick={onClose}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-md border border-gray-300"
          >
            Maybe Later
          </Button>
        </div>
      </div>
    </div>
  )
}
