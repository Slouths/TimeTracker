'use client'

import { loadStripe, Stripe } from '@stripe/stripe-js'
import { STRIPE_CONFIG } from './config'

let stripePromise: Promise<Stripe | null>

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey)
  }
  return stripePromise
}
