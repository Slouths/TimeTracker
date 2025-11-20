import { create } from 'zustand';
import { authService } from '@/services/supabase/auth';
import { logger } from '@/utils/logger';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, name?: string) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  setUser: (user: User | null) => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    logger.info('Auth', 'Initialization started');
    try {
      logger.debug('Auth', 'Fetching session from Supabase');
      const { data } = await authService.getSession();

      if (data.session?.user) {
        logger.info('Auth', 'Session found - user authenticated', { userId: data.session.user.id });
        set({
          user: {
            id: data.session.user.id,
            email: data.session.user.email!,
            name: data.session.user.user_metadata?.name || null,
            created_at: data.session.user.created_at,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        logger.info('Auth', 'No active session found');
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      logger.error('Auth', 'Initialization failed', error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  signIn: async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    if (!error && data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
          created_at: data.user.created_at,
        },
        isAuthenticated: true,
      });
    }
    return { error };
  },

  signUp: async (email, password, name) => {
    const { data, error } = await authService.signUp(email, password, name);
    if (!error && data.user) {
      set({
        user: {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name || null,
          created_at: data.user.created_at,
        },
        isAuthenticated: true,
      });
    }
    return { error };
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, isAuthenticated: false });
  },

  resetPassword: async (email) => {
    return await authService.resetPassword(email);
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));
