import { SupabaseClient } from '@supabase/supabase-js'

export interface Project {
  id: string
  user_id: string
  client_id: string
  name: string
  description: string | null
  budget: number | null
  status: 'active' | 'completed' | 'archived'
  created_at: string
  updated_at: string
}

export interface ProjectWithClient extends Project {
  clients: {
    name: string
  }
}

export interface ProjectStats {
  project_id: string
  project_name: string
  client_name: string
  total_hours: number
  total_earnings: number
  budget: number | null
  budget_used_percentage: number
  status: string
}

export type ProjectInput = Omit<
  Project,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>

export type ProjectUpdate = Partial<
  Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>

/**
 * Get all projects for a user
 */
export async function getProjects(
  supabase: SupabaseClient,
  userId: string
): Promise<ProjectWithClient[]> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (
        name
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching projects:', error)
    return []
  }

  return (data as ProjectWithClient[]) || []
}

/**
 * Get projects by client
 */
export async function getProjectsByClient(
  supabase: SupabaseClient,
  userId: string,
  clientId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('client_id', clientId)
    .order('name')

  if (error) {
    console.error('Error fetching projects by client:', error)
    return []
  }

  return data || []
}

/**
 * Get a single project by ID
 */
export async function getProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<ProjectWithClient | null> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      clients (
        name
      )
    `)
    .eq('id', projectId)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return data as ProjectWithClient
}

/**
 * Create a new project
 */
export async function createProject(
  supabase: SupabaseClient,
  userId: string,
  project: ProjectInput
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      ...project,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating project:', error)
    return null
  }

  return data
}

/**
 * Update a project
 */
export async function updateProject(
  supabase: SupabaseClient,
  projectId: string,
  updates: ProjectUpdate
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) {
    console.error('Error updating project:', error)
    return null
  }

  return data
}

/**
 * Delete a project
 */
export async function deleteProject(
  supabase: SupabaseClient,
  projectId: string
): Promise<boolean> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Error deleting project:', error)
    return false
  }

  return true
}

/**
 * Get project statistics with time entries
 */
export async function getProjectStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ProjectStats[]> {
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select(`
      id,
      name,
      budget,
      status,
      clients (
        name
      )
    `)
    .eq('user_id', userId)

  if (projectsError || !projects) {
    console.error('Error fetching projects:', projectsError)
    return []
  }

  const stats: ProjectStats[] = []

  for (const project of projects) {
    const { data: entries } = await supabase
      .from('time_entries')
      .select('duration_minutes, amount')
      .eq('project_id', project.id)
      .eq('user_id', userId)

    const totalMinutes = entries?.reduce((sum, e) => sum + e.duration_minutes, 0) || 0
    const totalEarnings = entries?.reduce((sum, e) => sum + e.amount, 0) || 0
    const budgetUsedPercentage = project.budget
      ? (totalEarnings / project.budget) * 100
      : 0

    stats.push({
      project_id: project.id,
      project_name: project.name,
      client_name: (project.clients as any).name,
      total_hours: totalMinutes / 60,
      total_earnings: totalEarnings,
      budget: project.budget,
      budget_used_percentage: budgetUsedPercentage,
      status: project.status,
    })
  }

  return stats
}
