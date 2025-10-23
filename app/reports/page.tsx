import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { ReportsContent } from '@/components/reports-content'

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
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-150">
              <Clock className="h-5 w-5 text-brand-green" />
              <span className="text-xl font-bold text-brand-charcoal">TradeTimer</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/profile"
                className="text-sm text-gray-600 hover:text-brand-green transition-colors duration-150 cursor-pointer hidden sm:inline font-medium border-b-2 border-transparent"
              >
                {user.email}
              </Link>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors duration-150 border-b-2 border-transparent"
              >
                Dashboard
              </Link>
              <Link
                href="/reports"
                className="text-sm font-semibold text-brand-green border-b-2 border-brand-green"
              >
                Reports
              </Link>
              <Link
                href="/help"
                className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors duration-150 border-b-2 border-transparent"
              >
                Help
              </Link>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  className="text-sm font-medium text-gray-600 hover:text-brand-charcoal transition-colors duration-150 border-b-2 border-transparent"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

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
