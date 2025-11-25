import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { DashboardContent } from '@/components/dashboard-content'
import { Navigation } from '@/components/layout/navigation'

export default async function DashboardPage() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      console.error('Error getting user:', error)
      redirect('/login')
    }

    if (!user) {
      redirect('/login')
    }

    return (
      <div className="min-h-screen bg-white">
        <Navigation user={user} />

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <DashboardContent userId={user.id} />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <a href="/login" className="text-brand-green hover:underline">
            Return to Login
          </a>
        </div>
      </div>
    )
  }
}
