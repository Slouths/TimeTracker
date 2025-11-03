import { supabase } from './client';
import type {
  Client,
  Project,
  TimeEntry,
  Invoice,
  InvoiceItem,
  UserSettings,
  TimerPreferences,
  Subscription,
  ReportFilter,
} from '@/types/models';

export const databaseService = {
  // Clients
  async getClients(userId: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', userId)
      .order('name');
    return { data: data as Client[] | null, error };
  },

  async getClient(id: string) {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as Client | null, error };
  },

  async createClient(client: Omit<Client, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('clients')
      .insert(client)
      .select()
      .single();
    return { data: data as Client | null, error };
  },

  async updateClient(id: string, updates: Partial<Client>) {
    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Client | null, error };
  },

  async deleteClient(id: string) {
    const { error } = await supabase.from('clients').delete().eq('id', id);
    return { error };
  },

  // Projects
  async getProjects(userId: string, clientId?: string) {
    let query = supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId);

    if (clientId) {
      query = query.eq('client_id', clientId);
    }

    const { data, error } = await query.order('name');
    return { data: data as Project[] | null, error };
  },

  async getProject(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();
    return { data: data as Project | null, error };
  },

  async createProject(project: Omit<Project, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('projects')
      .insert(project)
      .select()
      .single();
    return { data: data as Project | null, error };
  },

  async updateProject(id: string, updates: Partial<Project>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Project | null, error };
  },

  async deleteProject(id: string) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    return { error };
  },

  // Time Entries
  async getTimeEntries(userId: string, filters?: {
    startDate?: string;
    endDate?: string;
    clientId?: string;
    projectId?: string;
  }) {
    let query = supabase
      .from('time_entries')
      .select('*, clients(*), projects(*)')
      .eq('user_id', userId);

    if (filters?.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters?.endDate) {
      query = query.lte('start_time', filters.endDate);
    }
    if (filters?.clientId) {
      query = query.eq('client_id', filters.clientId);
    }
    if (filters?.projectId) {
      query = query.eq('project_id', filters.projectId);
    }

    const { data, error } = await query.order('start_time', { ascending: false });
    return { data: data as TimeEntry[] | null, error };
  },

  async getTimeEntry(id: string) {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*, clients(*), projects(*)')
      .eq('id', id)
      .single();
    return { data: data as TimeEntry | null, error };
  },

  async createTimeEntry(entry: Omit<TimeEntry, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('time_entries')
      .insert(entry)
      .select()
      .single();
    return { data: data as TimeEntry | null, error };
  },

  async updateTimeEntry(id: string, updates: Partial<TimeEntry>) {
    const { data, error } = await supabase
      .from('time_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as TimeEntry | null, error };
  },

  async deleteTimeEntry(id: string) {
    const { error } = await supabase.from('time_entries').delete().eq('id', id);
    return { error };
  },

  async deleteTimeEntries(ids: string[]) {
    const { error } = await supabase.from('time_entries').delete().in('id', ids);
    return { error };
  },

  // Invoices
  async getInvoices(userId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data as Invoice[] | null, error };
  },

  async getInvoice(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, clients(*), invoice_items(*)')
      .eq('id', id)
      .single();
    return { data, error };
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoice)
      .select()
      .single();
    return { data: data as Invoice | null, error };
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as Invoice | null, error };
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase.from('invoices').delete().eq('id', id);
    return { error };
  },

  // User Settings
  async getUserSettings(userId: string) {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data: data as UserSettings | null, error };
  },

  async updateUserSettings(userId: string, updates: Partial<UserSettings>) {
    const { data, error } = await supabase
      .from('user_settings')
      .upsert({ user_id: userId, ...updates })
      .select()
      .single();
    return { data: data as UserSettings | null, error };
  },

  // Timer Preferences
  async getTimerPreferences(userId: string) {
    const { data, error } = await supabase
      .from('timer_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data: data as TimerPreferences | null, error };
  },

  async updateTimerPreferences(userId: string, updates: Partial<TimerPreferences>) {
    const { data, error } = await supabase
      .from('timer_preferences')
      .upsert({ user_id: userId, ...updates })
      .select()
      .single();
    return { data: data as TimerPreferences | null, error };
  },

  // Subscription
  async getSubscription(userId: string) {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();
    return { data: data as Subscription | null, error };
  },

  // Report Filters
  async getReportFilters(userId: string) {
    const { data, error } = await supabase
      .from('report_filters')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data as ReportFilter[] | null, error };
  },

  async createReportFilter(filter: Omit<ReportFilter, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('report_filters')
      .insert(filter)
      .select()
      .single();
    return { data: data as ReportFilter | null, error };
  },

  async deleteReportFilter(id: string) {
    const { error } = await supabase.from('report_filters').delete().eq('id', id);
    return { error };
  },
};
