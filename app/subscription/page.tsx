'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/layout/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'
import { getUsageStats, getUserSubscription, PlanType } from '@/lib/plan-limits'
import { getStripe } from '@/lib/stripe/client'
import { Check } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

export default function SubscriptionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState<PlanType>('free')
  const [usage, setUsage] = useState({
    clientCount: 0,
    clientLimit: 1 as number | 'unlimited',
    entriesThisMonth: 0,
    entriesLimit: 10 as number | 'unlimited',
  })
  const [subscription, setSubscription] = useState<any>(null)
  const [processingCheckout, setProcessingCheckout] = useState(false)
  const [processingPortal, setProcessingPortal] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUser(user)

      // Load usage stats
      const stats = await getUsageStats(supabase, user.id)
      setPlan(stats.plan)
      setUsage({
        clientCount: stats.clientCount,
        clientLimit: stats.clientLimit,
        entriesThisMonth: stats.entriesThisMonth,
        entriesLimit: stats.entriesLimit,
      })

      // Load subscription details
      const sub = await getUserSubscription(supabase, user.id)
      setSubscription(sub)

      setLoading(false)
    }

    loadData()
  }, [supabase, router])

  const handleUpgrade = async () => {
    setProcessingCheckout(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
      })

      const { sessionId, error } = await response.json()

      if (error) {
        toast.error('Error', error)
        setProcessingCheckout(false)
        return
      }

      const stripe = await getStripe()
      if (!stripe) {
        toast.error('Error', 'Stripe failed to load')
        setProcessingCheckout(false)
        return
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      })

      if (stripeError) {
        toast.error('Error', stripeError.message)
      }
    } catch (error: any) {
      toast.error('Error', error.message)
    }

    setProcessingCheckout(false)
  }

  const handleManageSubscription = async () => {
    setProcessingPortal(true)

    try {
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      })

      const { url, error } = await response.json()

      if (error) {
        toast.error('Error', error)
        setProcessingPortal(false)
        return
      }

      window.location.href = url
    } catch (error: any) {
      toast.error('Error', error.message)
      setProcessingPortal(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">
            Subscription
          </h1>
          <p className="text-gray-600">
            Manage your plan and billing
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Current Plan */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-brand-charcoal mb-6">
              Current Plan
            </h2>

            <div className="mb-6">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-brand-charcoal">
                  {plan === 'free' ? 'Free' : 'Pro'}
                </span>
                {plan === 'pro' && (
                  <span className="text-gray-600">$15/month</span>
                )}
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-primary/10 text-accent-primary">
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </div>
            </div>

            {plan === 'pro' && subscription?.current_period_end && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  Next billing date:{' '}
                  <span className="font-semibold text-gray-900">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}

            {plan === 'free' ? (
              <Button
                onClick={handleUpgrade}
                disabled={processingCheckout}
                className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3 rounded-md font-semibold"
              >
                {processingCheckout ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            ) : (
              <Button
                onClick={handleManageSubscription}
                disabled={processingPortal}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 py-3 rounded-md border border-gray-300 font-semibold"
              >
                {processingPortal ? 'Loading...' : 'Manage Subscription'}
              </Button>
            )}
          </div>

          {/* Usage Stats */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-brand-charcoal mb-6">
              Usage This Month
            </h2>

            <div className="space-y-6">
              {/* Clients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Clients</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {usage.clientCount} / {usage.clientLimit === 'unlimited' ? '∞' : usage.clientLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent-primary h-2 rounded-full"
                    style={{
                      width: usage.clientLimit === 'unlimited'
                        ? '10%'
                        : `${Math.min((usage.clientCount / (usage.clientLimit as number)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Time Entries */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Time Entries</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {usage.entriesThisMonth} / {usage.entriesLimit === 'unlimited' ? '∞' : usage.entriesLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-accent-primary h-2 rounded-full"
                    style={{
                      width: usage.entriesLimit === 'unlimited'
                        ? '10%'
                        : `${Math.min((usage.entriesThisMonth / (usage.entriesLimit as number)) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {plan === 'free' && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    You're on the free plan. Upgrade to Pro for unlimited usage!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Plan Comparison */}
        {plan === 'free' && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <h2 className="text-xl font-bold text-brand-charcoal mb-6 text-center">
              Upgrade to Pro
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Free Plan */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Free</h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">$0</div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>1 client</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>10 time entries per month</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Basic reporting</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>CSV export</span>
                  </li>
                </ul>
              </div>

              {/* Pro Plan */}
              <div className="border-2 border-accent-primary rounded-lg p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-accent-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                  RECOMMENDED
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Pro</h3>
                <div className="text-3xl font-bold text-gray-900 mb-6">
                  $15<span className="text-lg text-gray-600">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Unlimited clients</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Unlimited time entries</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Project tracking</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>PDF + CSV export</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-gray-700">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span>Priority support</span>
                  </li>
                </ul>
                <Button
                  onClick={handleUpgrade}
                  disabled={processingCheckout}
                  className="w-full bg-accent-primary hover:bg-accent-primary/90 text-white py-3 rounded-md font-semibold"
                >
                  {processingCheckout ? 'Processing...' : 'Upgrade Now'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
