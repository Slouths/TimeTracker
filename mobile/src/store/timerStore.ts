import { create } from 'zustand';
import { databaseService } from '@/services/supabase/database';
import { calculateDuration, roundTime } from '@/utils/time';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  startTime: Date | null;
  pausedAt: Date | null;
  totalPausedTime: number;
  elapsedSeconds: number;
  selectedClientId: string | null;
  selectedProjectId: string | null;
  notes: string;
  start: (clientId: string, projectId?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: (userId: string, hourlyRate: number, roundingEnabled: boolean, roundingMinutes: number) => Promise<{ error?: any }>;
  setNotes: (notes: string) => void;
  updateElapsedSeconds: (seconds: number) => void;
  reset: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedAt: null,
  totalPausedTime: 0,
  elapsedSeconds: 0,
  selectedClientId: null,
  selectedProjectId: null,
  notes: '',

  start: (clientId, projectId) => {
    set({
      isRunning: true,
      isPaused: false,
      startTime: new Date(),
      pausedAt: null,
      totalPausedTime: 0,
      elapsedSeconds: 0,
      selectedClientId: clientId,
      selectedProjectId: projectId || null,
      notes: '',
    });
  },

  pause: () => {
    set({
      isPaused: true,
      pausedAt: new Date(),
    });
  },

  resume: () => {
    const { pausedAt, totalPausedTime } = get();
    if (pausedAt) {
      const now = new Date();
      const pausedDuration = Math.floor((now.getTime() - pausedAt.getTime()) / 1000);
      set({
        isPaused: false,
        pausedAt: null,
        totalPausedTime: totalPausedTime + pausedDuration,
      });
    }
  },

  stop: async (userId, hourlyRate, roundingEnabled, roundingMinutes) => {
    const { startTime, selectedClientId, selectedProjectId, notes, totalPausedTime } = get();

    if (!startTime || !selectedClientId) {
      return { error: new Error('Invalid timer state') };
    }

    const endTime = new Date();
    const totalSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    const activeSeconds = totalSeconds - totalPausedTime;
    let durationMinutes = Math.floor(activeSeconds / 60);

    // Apply rounding if enabled
    if (roundingEnabled && roundingMinutes > 0) {
      durationMinutes = roundTime(durationMinutes, roundingMinutes);
    }

    const amount = (durationMinutes / 60) * hourlyRate;

    const { error } = await databaseService.createTimeEntry({
      user_id: userId,
      client_id: selectedClientId,
      project_id: selectedProjectId,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      duration_minutes: durationMinutes,
      notes: notes || null,
      amount: amount,
    });

    if (!error) {
      set({
        isRunning: false,
        isPaused: false,
        startTime: null,
        pausedAt: null,
        totalPausedTime: 0,
        elapsedSeconds: 0,
        selectedClientId: null,
        selectedProjectId: null,
        notes: '',
      });
    }

    return { error };
  },

  setNotes: (notes) => set({ notes }),

  updateElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),

  reset: () => {
    set({
      isRunning: false,
      isPaused: false,
      startTime: null,
      pausedAt: null,
      totalPausedTime: 0,
      elapsedSeconds: 0,
      selectedClientId: null,
      selectedProjectId: null,
      notes: '',
    });
  },
}));
