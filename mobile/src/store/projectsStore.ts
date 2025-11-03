import { create } from 'zustand';
import { databaseService } from '@/services/supabase/database';
import type { Project } from '@/types/models';

interface ProjectsState {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: (userId: string, clientId?: string) => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'created_at'>) => Promise<{ error?: any }>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<{ error?: any }>;
  deleteProject: (id: string) => Promise<{ error?: any }>;
  getProject: (id: string) => Project | undefined;
  getProjectsByClient: (clientId: string) => Project[];
}

export const useProjectsStore = create<ProjectsState>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async (userId, clientId) => {
    set({ isLoading: true, error: null });
    const { data, error } = await databaseService.getProjects(userId, clientId);
    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ projects: data || [], isLoading: false });
    }
  },

  addProject: async (project) => {
    const { data, error } = await databaseService.createProject(project);
    if (!error && data) {
      set((state) => ({ projects: [...state.projects, data] }));
    }
    return { error };
  },

  updateProject: async (id, updates) => {
    const { data, error } = await databaseService.updateProject(id, updates);
    if (!error && data) {
      set((state) => ({
        projects: state.projects.map((p) => (p.id === id ? data : p)),
      }));
    }
    return { error };
  },

  deleteProject: async (id) => {
    const { error } = await databaseService.deleteProject(id);
    if (!error) {
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
      }));
    }
    return { error };
  },

  getProject: (id) => {
    return get().projects.find((p) => p.id === id);
  },

  getProjectsByClient: (clientId) => {
    return get().projects.filter((p) => p.client_id === clientId);
  },
}));
