'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Navigation } from '@/components/layout/navigation'
import { toast } from '@/lib/toast'
import { ReferralLink } from '@/components/referrals/referral-link'
import { generateReferralCode, checkReferralReward } from '@/lib/referral-utils'
import { Gift, Users, CheckCircle, Clock } from 'lucide-react'

interface Referral {
  id: string
  referred_email: string
  status: 'pending' | 'signed_up' | 'subscribed'
  created_at: string
  reward_granted: boolean
}

export default function ReferralsPage() {
  const [user, setUser] = useState<any>(null)
  const [referralCode, setReferralCode] = useState('')
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [rewardsEarned, setRewardsEarned] = useState(0)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    loadUser()
  }, [])

  useEffect(() => {
    if (user) {
      const code = generateReferralCode(user.id)
      setReferralCode(code)
      loadReferrals()
      loadRewards()
    }
  }, [user])

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function loadReferrals() {
    try {
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReferrals(data || [])
    } catch (error: any) {
      toast.error('Failed to load referrals: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadRewards() {
    const rewards = await checkReferralReward(user.id, supabase)
    setRewardsEarned(rewards)
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'subscribed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'signed_up':
        return <Users className="h-5 w-5 text-blue-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      default:
        return null
    }
  }

  function getStatusBadgeColor(status: string) {
    switch (status) {
      case 'subscribed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'signed_up':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation user={user} />
        <div className="flex justify-center items-center h-64">
          <div className="text-slate-600">Loading referrals...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-950">Referral Program</h1>
          <p className="text-slate-600 mt-2">Earn rewards by referring friends to TradeTimer</p>
        </div>

        {/* Rewards Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Gift className="h-6 w-6 text-accent-primary" />
              <h3 className="text-lg font-semibold text-slate-950">Rewards Earned</h3>
            </div>
            <p className="text-3xl font-bold text-accent-primary">
              {rewardsEarned} {rewardsEarned === 1 ? 'Month' : 'Months'}
            </p>
            <p className="text-sm text-slate-600 mt-1">Free subscription time</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Users className="h-6 w-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-950">Total Referrals</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{referrals.length}</p>
            <p className="text-sm text-slate-600 mt-1">People referred</p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <h3 className="text-lg font-semibold text-slate-950">Subscribed</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {referrals.filter(r => r.status === 'subscribed').length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Active subscribers</p>
          </div>
        </div>

        {/* Referral Link */}
        {referralCode && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-slate-950 mb-4">Your Referral Link</h2>
            <ReferralLink referralCode={referralCode} />

            <div className="mt-6 p-4 bg-accent-primary/5 rounded-lg border border-accent-primary/20">
              <h3 className="font-semibold text-slate-950 mb-2">How it works:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary font-bold">1.</span>
                  Share your unique referral link with friends and colleagues
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary font-bold">2.</span>
                  When they sign up using your link, you'll both get tracked
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary font-bold">3.</span>
                  When they subscribe to Pro, you'll receive 1 month free!
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent-primary font-bold">4.</span>
                  No limit - refer unlimited users and earn unlimited rewards
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Referrals Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-slate-950">Your Referrals</h2>
          </div>

          {referrals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-600 mb-4">No referrals yet</p>
              <p className="text-sm text-slate-500">
                Share your referral link to start earning rewards!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">
                      Reward
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {referrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {referral.referred_email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(referral.status)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(referral.status)}`}>
                            {referral.status.replace('_', ' ').charAt(0).toUpperCase() + referral.status.replace('_', ' ').slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {referral.reward_granted ? (
                          <span className="text-green-600 font-medium flex items-center gap-1">
                            <Gift className="h-4 w-4" />
                            Granted
                          </span>
                        ) : referral.status === 'subscribed' ? (
                          <span className="text-yellow-600 font-medium">Pending</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
