import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsContent } from '@/components/reports-content'
import { Navigation } from '@/components/layout/navigation'

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation user={user} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-charcoal mb-2">
            Reports & Analytics
          </h1>
          <p className="text-gray-600">
            Track your earnings and analyze your time
          </p>
        </div>

        <ReportsContent userId={user.id} />
      </main>
    </div>
  )
}
