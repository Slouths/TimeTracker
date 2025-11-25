import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FAQSection } from '@/components/help/faq-section'
import { ContactForm } from '@/components/help/contact-form'
import { Navigation } from '@/components/layout/navigation'

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
      <Navigation user={user} />

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
        <div className="mt-16 bg-slate-50 rounded-2xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold mb-2 text-brand-charcoal">Still need help?</h2>
          <p className="text-gray-600 mb-6">
            Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you within 24 hours.
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
