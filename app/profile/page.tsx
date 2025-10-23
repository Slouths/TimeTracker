import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock } from 'lucide-react'

export default async function ProfilePage() {
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
                className="text-sm font-semibold text-brand-green border-b-2 border-brand-green cursor-pointer hidden sm:inline"
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
                className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors duration-150 border-b-2 border-transparent"
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
            Profile
          </h1>
          <p className="text-gray-600">
            Manage your account settings
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 max-w-2xl">
          <h2 className="text-xl font-bold text-brand-charcoal mb-6">
            Account Information
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <p className="text-brand-charcoal font-semibold">
                {user.email}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                User ID
              </label>
              <p className="text-gray-600 text-sm font-mono">
                {user.id}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Created
              </label>
              <p className="text-gray-600">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
