import Constants from 'expo-constants';

export const config = {
  supabase: {
    url: Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '',
    anonKey: Constants.expoConfig?.extra?.supabaseAnonKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
  },
  stripe: {
    publishableKey: Constants.expoConfig?.extra?.stripePublishableKey || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  posthog: {
    apiKey: Constants.expoConfig?.extra?.posthogKey || process.env.EXPO_PUBLIC_POSTHOG_KEY || '',
    host: Constants.expoConfig?.extra?.posthogHost || process.env.EXPO_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
  },
  sentry: {
    dsn: Constants.expoConfig?.extra?.sentryDsn || process.env.EXPO_PUBLIC_SENTRY_DSN || '',
  },
  app: {
    env: Constants.expoConfig?.extra?.appEnv || process.env.EXPO_PUBLIC_APP_ENV || 'development',
    version: Constants.expoConfig?.version || '1.0.0',
  },
};

// Plan limits
export const PLAN_LIMITS = {
  free: {
    clients: 3,
    projects: 5,
    entries: 100,
    invoices: 5,
  },
  pro: {
    clients: Infinity,
    projects: Infinity,
    entries: Infinity,
    invoices: Infinity,
  },
};

// Timer settings
export const TIMER_SETTINGS = {
  MIN_IDLE_TIMEOUT: 5,
  MAX_IDLE_TIMEOUT: 60,
  DEFAULT_IDLE_TIMEOUT: 15,
  ROUNDING_OPTIONS: [5, 10, 15, 30],
  DEFAULT_ROUNDING: 15,
};
