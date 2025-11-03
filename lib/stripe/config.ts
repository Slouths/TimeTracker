// Stripe configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  proPriceId: process.env.STRIPE_PRO_PRICE_ID || '', // Monthly Pro plan price ID
}

export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
  },
  pro: {
    name: 'Pro',
    price: 15, // $15/month
    priceId: STRIPE_CONFIG.proPriceId,
  },
}
