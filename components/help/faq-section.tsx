'use client'

import { Disclosure } from '@headlessui/react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I add my first client?",
        a: "Click the 'Add New Client' button on the dashboard, fill in their name and hourly rate, then click 'Add Client'. You can also add optional contact details like email and phone number."
      },
      {
        q: "How do I set different hourly rates for different clients?",
        a: "Each client has their own hourly rate. When you add or edit a client, you can specify their unique rate. Your earnings are automatically calculated based on the selected client's rate."
      },
      {
        q: "Can I change a client's rate after creating them?",
        a: "Yes! Click the edit icon next to any client in the Clients List, update their hourly rate, and click 'Update Client'. Future time entries will use the new rate."
      }
    ]
  },
  {
    category: "Time Tracking",
    questions: [
      {
        q: "How do I start and stop the timer?",
        a: "Select a client from the dropdown in the Time Tracker card, then click 'Start Timer'. When you're done, click 'Stop & Save' to record the time entry. Your earnings are calculated automatically."
      },
      {
        q: "Can I manually add time entries?",
        a: "Currently, time entries are created when you stop the timer. Make sure to start the timer when you begin work and stop it when you finish to accurately track your billable hours."
      },
      {
        q: "What happens if I forget to stop the timer?",
        a: "If you forget to stop the timer, you can edit the time entry after saving it. Click the edit icon on the entry in your time entries list and adjust the duration or end time."
      },
      {
        q: "How are earnings calculated?",
        a: "Earnings are calculated automatically: (Duration in hours) × (Client's hourly rate) = Your earnings. For example, 2.5 hours at $75/hr = $187.50."
      }
    ]
  },
  {
    category: "Reports & Analytics",
    questions: [
      {
        q: "What reports are available?",
        a: "Navigate to the Reports page to see your earnings summary, hours worked, client breakdown, activity heatmap showing when you're most productive, and goal progress tracking."
      },
      {
        q: "How do I see my monthly earnings?",
        a: "On the Reports page, use the period filter to select 'This Month' or any custom date range. You'll see total earnings, hours worked, and a breakdown by client."
      },
      {
        q: "Can I export my time data?",
        a: "Yes! On the Reports page, click the 'Export Report' button to download a comprehensive HTML report with all your stats and client breakdowns."
      },
      {
        q: "What is the Activity Heatmap?",
        a: "The Activity Heatmap shows which days and hours you earn the most. Darker colors indicate higher earnings, helping you identify your most productive times."
      }
    ]
  },
  {
    category: "Account & Settings",
    questions: [
      {
        q: "How do I update my profile information?",
        a: "Click on your email address in the top navigation bar to access your profile page. There you can view your account information."
      },
      {
        q: "Is my data secure?",
        a: "Yes! Your data is stored securely with Supabase using industry-standard encryption. Only you can access your clients, time entries, and reports. Each user's data is completely private and isolated."
      },
      {
        q: "Can I delete my account?",
        a: "To delete your account, please contact our support team through the form below. We'll process your request and permanently remove all your data."
      }
    ]
  },
  {
    category: "Common Issues",
    questions: [
      {
        q: "Timer not starting?",
        a: "Make sure you've selected a client from the dropdown before clicking 'Start Timer'. You must have at least one client added to start tracking time."
      },
      {
        q: "Client dropdown is empty?",
        a: "You need to add at least one client before you can start tracking time. Click the 'Add New Client' button, fill in their details, and then you'll be able to select them in the timer."
      },
      {
        q: "Can't see my time entries?",
        a: "Your recent time entries appear on the dashboard below the timer. If you're not seeing them, try refreshing the page. You can also view all entries on the Reports page."
      }
    ]
  }
]

export function FAQSection() {
  return (
    <div className="space-y-8">
      {faqs.map((category) => (
        <div key={category.category}>
          <h2 className="text-2xl font-bold text-brand-charcoal mb-4">
            {category.category}
          </h2>
          <div className="space-y-2">
            {category.questions.map((faq, index) => (
              <Disclosure key={index}>
                {({ open }) => (
                  <div className="bg-white rounded-lg border border-gray-200">
                    <Disclosure.Button className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-50 transition-colors">
                      <span className="font-medium text-brand-charcoal">
                        {faq.q}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-gray-400 transition-transform ${
                          open ? 'rotate-180' : ''
                        }`}
                      />
                    </Disclosure.Button>
                    <Disclosure.Panel className="p-4 pt-0 text-gray-600">
                      {faq.a}
                    </Disclosure.Panel>
                  </div>
                )}
              </Disclosure>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
