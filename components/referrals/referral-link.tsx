'use client'

import { useState } from 'react'
import { Copy, Check, Share2, Mail } from 'lucide-react'
import { toast } from '@/lib/toast'
import { getReferralLink } from '@/lib/referral-utils'

interface ReferralLinkProps {
  referralCode: string
}

export function ReferralLink({ referralCode }: ReferralLinkProps) {
  const [copied, setCopied] = useState(false)
  const referralLink = getReferralLink(referralCode)

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(referralLink)
      setCopied(true)
      toast.success('Referral link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  function shareViaEmail() {
    const subject = 'Try TradeTimer - Time Tracking for Tradespeople'
    const body = `Hey! I've been using TradeTimer to track my work hours and it's been great. Check it out using my referral link:\n\n${referralLink}\n\nYou'll get a great tool for managing your time and invoices!`

    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  function shareViaTwitter() {
    const text = `I'm using TradeTimer to track my work hours and manage invoices. Check it out!`
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
      '_blank'
    )
  }

  function shareViaLinkedIn() {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`,
      '_blank'
    )
  }

  return (
    <div className="space-y-4">
      {/* Referral Code */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Referral Code
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-md">
            <code className="text-lg font-mono font-bold text-accent-primary">
              {referralCode}
            </code>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Referral Link
        </label>
        <div className="flex items-center gap-2">
          <div className="flex-1 px-4 py-3 bg-slate-50 border border-gray-200 rounded-md">
            <code className="text-sm text-slate-700 break-all">
              {referralLink}
            </code>
          </div>
          <button
            onClick={copyToClipboard}
            className="px-4 py-3 bg-accent-primary text-white rounded-md hover:bg-accent-hover transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Share via
        </label>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={shareViaEmail}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-slate-700 hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={shareViaTwitter}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-slate-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Twitter
          </button>
          <button
            onClick={shareViaLinkedIn}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-slate-700 hover:bg-gray-50 transition-colors"
          >
            <Share2 className="h-4 w-4" />
            LinkedIn
          </button>
        </div>
      </div>
    </div>
  )
}
