import { createHash } from 'crypto'

export function generateReferralCode(userId: string): string {
  // Create a hash of the user ID and take first 8 characters
  const hash = createHash('sha256')
    .update(userId + 'TRADETIMER_SALT')
    .digest('hex')
    .substring(0, 8)
    .toUpperCase()

  return hash
}

export function getReferralLink(referralCode: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/signup?ref=${referralCode}`
}

export async function checkReferralReward(userId: string, supabase: any): Promise<number> {
  // Get count of referred users who have subscribed
  const { data, error } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', userId)
    .eq('status', 'subscribed')
    .eq('reward_granted', true)

  if (error) {
    console.error('Error checking referral rewards:', error)
    return 0
  }

  return data?.length || 0
}

export async function grantReferralReward(referrerId: string, supabase: any): Promise<boolean> {
  try {
    // Get current subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', referrerId)
      .single()

    if (subError) throw subError

    // Add 30 days to subscription end date
    const currentEndDate = subscription.end_date
      ? new Date(subscription.end_date)
      : new Date()

    const newEndDate = new Date(currentEndDate)
    newEndDate.setDate(newEndDate.getDate() + 30)

    // Update subscription
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        end_date: newEndDate.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', referrerId)

    if (updateError) throw updateError

    return true
  } catch (error) {
    console.error('Error granting referral reward:', error)
    return false
  }
}
