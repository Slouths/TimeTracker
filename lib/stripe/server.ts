import Stripe from 'stripe'
import { STRIPE_CONFIG } from './config'

export const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})
