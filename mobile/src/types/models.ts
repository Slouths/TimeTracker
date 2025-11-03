export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  hourly_rate: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  client_id: string;
  name: string;
  description: string | null;
  status: 'active' | 'completed' | 'on_hold';
  budget_hours: number | null;
  color: string | null;
  created_at: string;
}

export interface TimeEntry {
  id: string;
  user_id: string;
  client_id: string;
  project_id: string | null;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  notes: string | null;
  amount: number;
  created_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface UserSettings {
  id: string;
  user_id: string;
  timezone: string;
  currency: string;
  date_format: string;
  time_format: '12h' | '24h';
  week_start: number;
  created_at: string;
  updated_at: string;
}

export interface TimerPreferences {
  id: string;
  user_id: string;
  rounding_enabled: boolean;
  rounding_minutes: number;
  idle_detection_enabled: boolean;
  idle_timeout_minutes: number;
  require_notes: boolean;
  auto_start_timer: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan: 'free' | 'pro';
  status: 'active' | 'canceled' | 'past_due';
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportFilter {
  id: string;
  user_id: string;
  name: string;
  filter_data: {
    start_date?: string;
    end_date?: string;
    client_ids?: string[];
    project_ids?: string[];
  };
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
}
