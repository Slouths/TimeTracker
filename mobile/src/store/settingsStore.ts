import { create } from 'zustand';
import { databaseService } from '@/services/supabase/database';
import type { UserSettings, TimerPreferences, Subscription } from '@/types/models';

interface SettingsState {
  userSettings: UserSettings | null;
  timerPreferences: TimerPreferences | null;
  subscription: Subscription | null;
  isLoading: boolean;
  fetchSettings: (userId: string) => Promise<void>;
  updateUserSettings: (userId: string, updates: Partial<UserSettings>) => Promise<{ error?: any }>;
  updateTimerPreferences: (userId: string, updates: Partial<TimerPreferences>) => Promise<{ error?: any }>;
  fetchSubscription: (userId: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  userSettings: null,
  timerPreferences: null,
  subscription: null,
  isLoading: false,

  fetchSettings: async (userId) => {
    set({ isLoading: true });

    const [settingsResult, prefsResult] = await Promise.all([
      databaseService.getUserSettings(userId),
      databaseService.getTimerPreferences(userId),
    ]);

    set({
      userSettings: settingsResult.data || {
        id: '',
        user_id: userId,
        timezone: 'America/New_York',
        currency: 'USD',
        date_format: 'MM/dd/yyyy',
        time_format: '12h',
        week_start: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      timerPreferences: prefsResult.data || {
        id: '',
        user_id: userId,
        rounding_enabled: false,
        rounding_minutes: 15,
        idle_detection_enabled: true,
        idle_timeout_minutes: 15,
        require_notes: false,
        auto_start_timer: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isLoading: false,
    });
  },

  updateUserSettings: async (userId, updates) => {
    const { data, error } = await databaseService.updateUserSettings(userId, updates);
    if (!error && data) {
      set({ userSettings: data });
    }
    return { error };
  },

  updateTimerPreferences: async (userId, updates) => {
    const { data, error } = await databaseService.updateTimerPreferences(userId, updates);
    if (!error && data) {
      set({ timerPreferences: data });
    }
    return { error };
  },

  fetchSubscription: async (userId) => {
    const { data } = await databaseService.getSubscription(userId);
    set({ subscription: data });
  },
}));
