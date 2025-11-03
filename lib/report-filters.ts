import { createClient } from '@/lib/supabase/client'

export interface ReportFilter {
  id: string
  user_id: string
  name: string
  time_period: 'week' | 'month' | 'year' | 'all'
  start_date: string | null
  end_date: string | null
  selected_clients: string[]
  created_at: string
}

export async function getSavedFilters(userId: string): Promise<ReportFilter[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('report_filters')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading saved filters:', error)
    return []
  }

  return data || []
}

export async function saveReportFilter(
  userId: string,
  name: string,
  timePeriod: 'week' | 'month' | 'year' | 'all',
  startDate: string,
  endDate: string,
  selectedClients: string[]
): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase.from('report_filters').insert({
    user_id: userId,
    name,
    time_period: timePeriod,
    start_date: startDate || null,
    end_date: endDate || null,
    selected_clients: selectedClients,
  })

  if (error) {
    console.error('Error saving filter:', error)
    return false
  }

  return true
}

export async function deleteReportFilter(filterId: string): Promise<boolean> {
  const supabase = createClient()
  const { error } = await supabase
    .from('report_filters')
    .delete()
    .eq('id', filterId)

  if (error) {
    console.error('Error deleting filter:', error)
    return false
  }

  return true
}
