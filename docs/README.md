# TradeTimer Documentation

## Overview
Complete documentation for the TradeTimer time tracking and invoicing application.

---

## Documentation Files

### Implementation Guides
- **[PART4_IMPLEMENTATION_GUIDE.md](./PART4_IMPLEMENTATION_GUIDE.md)** - Comprehensive technical guide for Part 4 features (60+ pages)
- **[PART4_SUMMARY.md](./PART4_SUMMARY.md)** - Executive summary and quick reference

---

## Quick Start

### For Developers

1. **Database Setup**
   ```bash
   # Run migration in Supabase SQL Editor
   # File: supabase/migrations/part4-features.sql
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env.local
   # Add your API keys
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

### For Deployment

See [Deployment Checklist](./PART4_IMPLEMENTATION_GUIDE.md#deployment-checklist) in the implementation guide.

---

## Key Features (Part 4)

### ✅ Implemented
- Projects Management System
- Email Notifications (Resend)
- Analytics (PostHog)
- Enhanced Exports (QuickBooks, Xero)
- Input Sanitization (DOMPurify)
- Rate Limiting (Upstash)
- PWA Support
- Invoice Tracking Infrastructure

### 🔄 Partial
- Invoice Payment Tracking (database done, UI pending)
- Project Selection (schema ready, UI integration pending)
- Bulk Operations (component ready, actions pending)

### ❌ Not Implemented
- Enhanced Reporting Features
- Sentry Error Logging
- Referral Program
- Activity Status Indicators

---

## Architecture

```
TradeTimer/
├── app/                    # Next.js app router pages
│   ├── projects/          # Projects management (NEW)
│   ├── api/email/         # Email API (NEW)
│   └── ...
├── components/
│   ├── projects/          # Project components (NEW)
│   ├── providers/         # Analytics provider (NEW)
│   └── ...
├── lib/
│   ├── analytics/         # PostHog integration (NEW)
│   ├── email/             # Resend integration (NEW)
│   ├── sanitize.ts        # Input sanitization (NEW)
│   ├── rate-limit.ts      # Rate limiting (NEW)
│   ├── invoices.ts        # Invoice utilities (NEW)
│   ├── projects.ts        # Project utilities (NEW)
│   └── ...
├── emails/                # React Email templates (NEW)
├── supabase/migrations/   # Database migrations
└── docs/                  # This folder
```

---

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRO_PRICE_ID`

### Optional (Recommended)
- `RESEND_API_KEY` - Email sending
- `FROM_EMAIL` - Email sender address
- `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
- `NEXT_PUBLIC_POSTHOG_HOST` - PostHog host
- `UPSTASH_REDIS_REST_URL` - Rate limiting
- `UPSTASH_REDIS_REST_TOKEN` - Redis token

See [.env.example](../.env.example) for complete list.

---

## Database Schema

### New Tables (Part 4)
1. **projects** - Client project management
2. **invoices** - Invoice tracking and payment status
3. **referrals** - User referral program
4. **report_filters** - Saved report configurations
5. **user_settings** - User preferences

### Modified Tables
- **time_entries** - Added `project_id` column

---

## API Reference

### Email API
**POST** `/api/email/send`

Send invoice or weekly summary emails.

**Rate Limit:** 5 requests/minute per user

**Request:**
```json
{
  "type": "invoice",
  "to": "client@example.com",
  "data": {
    "clientName": "Acme Corp",
    "invoiceNumber": "INV-2025-0001",
    "amount": 1500,
    "dueDate": "2025-02-15",
    "businessName": "Your Business"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": { "id": "email-id" }
}
```

---

## Testing

### Manual Testing
See [Testing Guide](./PART4_IMPLEMENTATION_GUIDE.md#testing-guide) for complete checklist.

### Key Test Cases
1. Create/edit/delete project
2. Send test email
3. Track analytics event
4. Export to QuickBooks/Xero
5. Verify input sanitization
6. Test rate limiting
7. Install PWA

---

## Troubleshooting

### Common Issues

**Email not sending**
- Verify RESEND_API_KEY is set
- Check Resend dashboard for delivery status
- Ensure FROM_EMAIL domain is verified

**Analytics not tracking**
- Check NEXT_PUBLIC_POSTHOG_KEY is set
- Verify PostHog project is active
- Check browser console for errors

**Rate limiting errors**
- Verify Upstash Redis connection
- Check rate limit configuration
- Review Upstash dashboard

**Projects not saving**
- Ensure database migration ran
- Check Supabase RLS policies
- Verify user authentication

---

## Performance

### Build Size
Part 4 adds ~150KB (gzipped) to bundle size.

### Load Time
- Analytics Provider: ~5ms overhead
- Email templates: Lazy loaded
- Minimal impact on Core Web Vitals

---

## Security

### Implemented
- ✅ Input sanitization (XSS protection)
- ✅ Rate limiting (abuse prevention)
- ✅ Environment variable protection
- ✅ Row Level Security (RLS) in database

### Recommended
- 🔄 Sentry error logging
- 🔄 HTTPS only (production)
- 🔄 CORS configuration
- 🔄 CSP headers

---

## Contributing

### Code Style
- Use TypeScript strict mode
- Follow existing patterns
- Add comments for complex logic
- Keep components small and focused

### Before Committing
1. Run `npm run lint`
2. Test locally
3. Check for console errors
4. Update documentation if needed

---

## Resources

### External Documentation
- [Next.js 15](https://nextjs.org/docs)
- [Supabase](https://supabase.com/docs)
- [Resend](https://resend.com/docs)
- [PostHog](https://posthog.com/docs)
- [Upstash](https://docs.upstash.com/)
- [React Email](https://react.email)

### Internal Documentation
- [Part 4 Implementation Guide](./PART4_IMPLEMENTATION_GUIDE.md)
- [Part 4 Summary](./PART4_SUMMARY.md)
- [Database Schema](../supabase-schema.sql)

---

## Version History

### Part 4 (November 2, 2025)
- Added projects management
- Integrated email notifications
- Added analytics tracking
- Enhanced export functionality
- Implemented security features
- Added PWA support

### Part 3 (Previous)
- Subscription management
- Stripe integration
- Time entries management
- Advanced features

### Part 2 (Previous)
- Dashboard enhancements
- Reporting system
- Client management

### Part 1 (Previous)
- Initial setup
- Authentication
- Basic time tracking

---

## License

Proprietary - All rights reserved

---

## Support

For technical support:
1. Check this documentation
2. Review implementation guides
3. Check GitHub issues (if applicable)
4. Contact development team

---

**Last Updated:** November 2, 2025
**Version:** 1.0.0
