import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Clock, HelpCircle } from 'lucide-react'
import { FAQSection } from '@/components/help/faq-section'
import { ContactForm } from '@/components/help/contact-form'

export default async function HelpPage() {
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
                className="text-sm font-medium text-gray-600 hover:text-brand-green transition-colors duration-150 border-b-2 border-transparent"
              >
                Reports
              </Link>
              <Link
                href="/help"
                className="text-sm font-semibold text-brand-green border-b-2 border-brand-green"
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

      {/* Help Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-brand-charcoal mb-6">
            How can we help?
          </h1>
          <p className="text-gray-600 text-lg mb-12">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* FAQ Accordion Sections */}
        <FAQSection />

        {/* Contact Form */}
        <div className="mt-16 bg-gradient-to-br from-brand-green/5 to-brand-sky/5 rounded-2xl p-8 border border-brand-green/10">
          <h2 className="text-2xl font-bold mb-2 text-brand-charcoal">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can't find what you're looking for? Send us a message and we'll get back to you within 24 hours.
          </p>
          <ContactForm />
        </div>

        {/* Additional Resources */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 text-sm">
            Need to get back to work?{' '}
            <Link href="/dashboard" className="text-brand-green hover:underline font-medium">
              Return to Dashboard
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
