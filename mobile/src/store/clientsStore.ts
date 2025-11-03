import { create } from 'zustand';
import { databaseService } from '@/services/supabase/database';
import type { Client } from '@/types/models';

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  error: string | null;
  fetchClients: (userId: string) => Promise<void>;
  addClient: (client: Omit<Client, 'id' | 'created_at'>) => Promise<{ error?: any }>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<{ error?: any }>;
  deleteClient: (id: string) => Promise<{ error?: any }>;
  getClient: (id: string) => Client | undefined;
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  clients: [],
  isLoading: false,
  error: null,

  fetchClients: async (userId) => {
    set({ isLoading: true, error: null });
    const { data, error } = await databaseService.getClients(userId);
    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ clients: data || [], isLoading: false });
    }
  },

  addClient: async (client) => {
    const { data, error } = await databaseService.createClient(client);
    if (!error && data) {
      set((state) => ({ clients: [...state.clients, data] }));
    }
    return { error };
  },

  updateClient: async (id, updates) => {
    const { data, error } = await databaseService.updateClient(id, updates);
    if (!error && data) {
      set((state) => ({
        clients: state.clients.map((c) => (c.id === id ? data : c)),
      }));
    }
    return { error };
  },

  deleteClient: async (id) => {
    const { error } = await databaseService.deleteClient(id);
    if (!error) {
      set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      }));
    }
    return { error };
  },

  getClient: (id) => {
    return get().clients.find((c) => c.id === id);
  },
}));
