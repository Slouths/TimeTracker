import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/resend-client'
import { render } from '@react-email/render'
import InvoiceEmail from '@/emails/invoice-email'
import WeeklySummaryEmail from '@/emails/weekly-summary-email'
import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting - strict for email sending
    const rateLimitResult = await checkRateLimit(user.id, true)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          },
        }
      )
    }

    const body = await req.json()
    const { type, to, data } = body

    let html: string
    let subject: string

    // Generate email based on type
    switch (type) {
      case 'invoice':
        subject = `Invoice ${data.invoiceNumber} from ${data.businessName}`
        html = await render(
          InvoiceEmail({
            clientName: data.clientName,
            invoiceNumber: data.invoiceNumber,
            amount: data.amount,
            dueDate: data.dueDate,
            businessName: data.businessName,
          })
        )
        break

      case 'weekly_summary':
        subject = 'Your weekly time tracking summary'
        html = await render(
          WeeklySummaryEmail({
            userName: data.userName,
            weekStart: data.weekStart,
            weekEnd: data.weekEnd,
            totalHours: data.totalHours,
            totalEarnings: data.totalEarnings,
            topClient: data.topClient,
            topClientHours: data.topClientHours,
          })
        )
        break

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        )
    }

    // Send email
    const result = await sendEmail({
      to,
      subject,
      html,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: result.data })
  } catch (error) {
    console.error('Email API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
