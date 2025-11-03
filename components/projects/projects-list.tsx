'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getProjects, deleteProject, ProjectWithClient } from '@/lib/projects'
import { getProjectStats, ProjectStats } from '@/lib/projects'
import { Plus, Edit, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import AddProjectModal from './add-project-modal'
import { trackEvent } from '@/lib/analytics/events'

interface GroupedProjects {
  [clientName: string]: {
    projects: ProjectWithClient[]
    stats: { [projectId: string]: ProjectStats }
  }
}

export default function ProjectsList() {
  const [projects, setProjects] = useState<ProjectWithClient[]>([])
  const [stats, setStats] = useState<ProjectStats[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ProjectWithClient | null>(null)
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set())
  const supabase = createClient()

  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const [projectsData, statsData] = await Promise.all([
      getProjects(supabase, user.id),
      getProjectStats(supabase, user.id),
    ])

    setProjects(projectsData)
    setStats(statsData)
    setLoading(false)
  }

  function toggleClient(clientName: string) {
    const newExpanded = new Set(expandedClients)
    if (newExpanded.has(clientName)) {
      newExpanded.delete(clientName)
    } else {
      newExpanded.add(clientName)
    }
    setExpandedClients(newExpanded)
  }

  async function handleDelete(projectId: string) {
    if (!confirm('Are you sure you want to delete this project?')) return

    const success = await deleteProject(supabase, projectId)

    if (success) {
      toast.success('Project deleted successfully')
      trackEvent('project_deleted')
      loadProjects()
    } else {
      toast.error('Failed to delete project')
    }
  }

  function handleEdit(project: ProjectWithClient) {
    setEditingProject(project)
    setIsAddModalOpen(true)
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'archived':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  function getBudgetColor(percentage: number) {
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 90) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Group projects by client
  const groupedProjects: GroupedProjects = projects.reduce((acc, project) => {
    const clientName = project.clients.name
    if (!acc[clientName]) {
      acc[clientName] = { projects: [], stats: {} }
    }
    acc[clientName].projects.push(project)

    const projectStat = stats.find((s) => s.project_id === project.id)
    if (projectStat) {
      acc[clientName].stats[project.id] = projectStat
    }

    return acc
  }, {} as GroupedProjects)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {projects.length} {projects.length === 1 ? 'project' : 'projects'}
        </div>
        <button
          onClick={() => {
            setEditingProject(null)
            setIsAddModalOpen(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          <Plus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-12 text-center">
          <div className="mx-auto max-w-sm">
            <h3 className="text-lg font-medium text-gray-900">No projects yet</h3>
            <p className="mt-2 text-sm text-gray-600">
              Get started by creating your first project to organize your work
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedProjects).map(([clientName, data]) => (
            <div key={clientName} className="overflow-hidden rounded-lg bg-white shadow">
              <button
                onClick={() => toggleClient(clientName)}
                className="flex w-full items-center justify-between bg-gray-50 px-6 py-4 text-left hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  {expandedClients.has(clientName) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{clientName}</h3>
                  <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
                    {data.projects.length} {data.projects.length === 1 ? 'project' : 'projects'}
                  </span>
                </div>
              </button>

              {expandedClients.has(clientName) && (
                <div className="divide-y divide-gray-200">
                  {data.projects.map((project) => {
                    const projectStat = data.stats[project.id]

                    return (
                      <div key={project.id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <h4 className="font-medium text-gray-900">{project.name}</h4>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                                {project.status}
                              </span>
                            </div>
                            {project.description && (
                              <p className="mt-1 text-sm text-gray-600">{project.description}</p>
                            )}

                            {projectStat && (
                              <div className="mt-3 grid grid-cols-3 gap-4">
                                <div>
                                  <div className="text-xs text-gray-500">Hours</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {projectStat.total_hours.toFixed(1)}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-xs text-gray-500">Earnings</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    ${projectStat.total_earnings.toFixed(2)}
                                  </div>
                                </div>
                                {project.budget && (
                                  <div>
                                    <div className="text-xs text-gray-500">Budget</div>
                                    <div className="text-sm font-medium text-gray-900">
                                      ${project.budget.toFixed(2)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {project.budget && projectStat && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-600">
                                  <span>Budget Used</span>
                                  <span>{projectStat.budget_used_percentage.toFixed(0)}%</span>
                                </div>
                                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                  <div
                                    className={`h-full transition-all ${getBudgetColor(projectStat.budget_used_percentage)}`}
                                    style={{
                                      width: `${Math.min(projectStat.budget_used_percentage, 100)}%`,
                                    }}
                                  />
                                </div>
                                {projectStat.budget_used_percentage > 100 && (
                                  <p className="mt-1 text-xs text-red-600">Over budget!</p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="ml-4 flex gap-2">
                            <button
                              onClick={() => handleEdit(project)}
                              className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                              title="Edit project"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(project.id)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Delete project"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingProject(null)
        }}
        onSuccess={loadProjects}
        editingProject={editingProject}
      />
    </div>
  )
}
