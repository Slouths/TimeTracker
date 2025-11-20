import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { config } from '@/constants/config';
import { logger } from '@/utils/logger';

// Configuration validation
logger.debug('Supabase', 'Initializing Supabase client', {
  url: config.supabase.url,
  hasAnonKey: !!config.supabase.anonKey,
});

if (!config.supabase.url || !config.supabase.anonKey) {
  logger.error('Supabase', 'Missing Supabase configuration. Check .env file.');
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

logger.info('Supabase', 'Client initialized successfully');
