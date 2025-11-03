import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SetupBanner } from '@/components/setup-banner'
import { Clock, FileText, Zap, Shield, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-white">
      {/* Setup Banner */}
      <SetupBanner />

      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Clock className="h-8 w-8 text-brand-green" />
              <span className="text-2xl font-bold text-brand-charcoal">TradeTimer</span>
            </Link>
            <div className="flex gap-4 items-center">
              {user ? (
                <>
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    {user.email}
                  </span>
                  <Link href="/dashboard">
                    <Button variant="ghost">Dashboard</Button>
                  </Link>
                  <form action="/auth/signout" method="post">
                    <Button variant="outline" type="submit">
                      Sign Out
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Start Free Trial</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-5xl sm:text-6xl font-bold text-brand-charcoal mb-6">
            Stop Losing Money to Untracked Hours
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Track time in one tap. Invoice in one click. Built for trade workers who are too busy for complicated software.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6 w-full sm:w-auto">
                Start Free Trial
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Free for 14 days. No credit card required.
          </p>
        </div>

        {/* Hero Image Placeholder */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-brand-green to-brand-sky rounded-2xl shadow-2xl p-8 aspect-video flex items-center justify-center">
            <div className="text-center text-white">
              <Smartphone className="h-24 w-24 mx-auto mb-4 opacity-80" />
              <p className="text-xl font-semibold">Mobile-First Design</p>
              <p className="text-sm opacity-80">Works perfectly on your phone</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-charcoal mb-6">
              You&apos;re Losing $500-1,000 Every Month
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Forgetting to track 30 minutes here, an hour there. By the end of the month, it adds up to serious money left on the table.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-4xl font-bold text-brand-charcoal mb-2">30%</p>
                <p className="text-gray-600">of billable hours go untracked</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-4xl font-bold text-brand-charcoal mb-2">3+ hours</p>
                <p className="text-gray-600">wasted per week on paperwork</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <p className="text-4xl font-bold text-brand-charcoal mb-2">$800</p>
                <p className="text-gray-600">average monthly loss from bad tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">
              Simple Tools for Trade Workers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No complicated menus. No endless settings. Just the features you actually need.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="flex items-center justify-center mb-4">
                <Zap className="h-12 w-12 text-brand-green" />
              </div>
              <h3 className="text-xl font-semibold text-brand-charcoal mb-2">One-Tap Tracking</h3>
              <p className="text-gray-600">
                Start and stop tracking with a single tap. No forms, no friction.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center mb-4">
                <FileText className="h-12 w-12 text-brand-green" />
              </div>
              <h3 className="text-xl font-semibold text-brand-charcoal mb-2">One-Click Invoicing</h3>
              <p className="text-gray-600">
                Generate professional PDF invoices instantly. Send and get paid faster.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center mb-4">
                <Smartphone className="h-12 w-12 text-brand-green" />
              </div>
              <h3 className="text-xl font-semibold text-brand-charcoal mb-2">Mobile-First</h3>
              <p className="text-gray-600">
                Works perfectly on your phone. Track time from the job site, not your desk.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-12 w-12 text-brand-green" />
              </div>
              <h3 className="text-xl font-semibold text-brand-charcoal mb-2">Client Management</h3>
              <p className="text-gray-600">
                Store client details, hourly rates, and contact info in one place.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-12 w-12 text-brand-green" />
              </div>
              <h3 className="text-xl font-semibold text-brand-charcoal mb-2">Your Data, Secured</h3>
              <p className="text-gray-600">
                Bank-level encryption. Your client data and invoices are always protected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-brand-charcoal text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Three Steps to Get Paid Faster
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              It&apos;s so simple, you&apos;ll wonder why you didn&apos;t start sooner.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-brand-green w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Tap START WORK</h3>
              <p className="text-gray-300">
                Select your client and tap the big green button. Timer starts running.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-sky w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Tap STOP WORK</h3>
              <p className="text-gray-300">
                When the job&apos;s done, tap stop. Add notes if you want. That&apos;s it.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-brand-amber w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Send Invoice</h3>
              <p className="text-gray-300">
                Generate a professional PDF invoice with one tap. Email it to your client.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-charcoal mb-4">
              Simple, Honest Pricing
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              No surprises. No hidden fees. Just one low price with everything included.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-brand-charcoal">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">1 client</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">10 time entries per month</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Basic invoicing</span>
                </li>
              </ul>
              <Link href="/signup" className="block">
                <Button variant="outline" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="border-2 border-brand-green rounded-2xl p-8 relative bg-brand-green/5">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-brand-green text-white px-4 py-1 rounded-full text-sm font-semibold">
                  MOST POPULAR
                </span>
              </div>
              <h3 className="text-2xl font-bold text-brand-charcoal mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-brand-charcoal">$15</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Unlimited clients</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Unlimited time tracking</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Unlimited invoices</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Advanced reporting</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 text-brand-green mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-600">Priority support</span>
                </li>
              </ul>
              <Link href="/signup" className="block">
                <Button className="w-full">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-8">
            Cancel anytime. No questions asked.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-green py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Stop Losing Money?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join hundreds of trade workers tracking every billable hour.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Your Free Trial
            </Button>
          </Link>
          <p className="text-sm text-white/80 mt-4">
            14 days free. No credit card required.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Clock className="h-6 w-6 text-brand-green" />
              <span className="text-xl font-bold">TradeTimer</span>
            </div>
            <div className="text-sm text-gray-400">
              {new Date().getFullYear()} TradeTimer. Built for trade workers, by developers who care.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
