# Part 3 Quick Start Guide

## What Was Implemented

Part 3 adds critical functionality for:
- User settings and preferences
- Advanced time entry management
- Projects feature foundation
- Stripe subscription system
- Plan limits and enforcement
- Subscription management UI

---

## Installation Steps

### 1. Install Stripe Dependencies

```bash
npm install stripe @stripe/stripe-js
```

### 2. Set Up Environment Variables

Create `.env.local` file in the project root:

```env
# Existing Supabase vars (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# NEW: Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

### 3. Run Database Migrations

Go to your Supabase Dashboard → SQL Editor and run these migrations **in order**:

#### Migration 1: Projects
```sql
-- Copy and paste from: supabase/migrations/20250102_create_projects.sql
```

#### Migration 2: Subscriptions
```sql
-- Copy and paste from: supabase/migrations/20250102_create_subscriptions.sql
```

#### Migration 3: Report Filters
```sql
-- Copy and paste from: supabase/migrations/20250102_create_report_filters.sql
```

### 4. Set Up Stripe (Optional - for testing subscriptions)

1. **Create Stripe Account:**
   - Go to https://stripe.com
   - Sign up for a free account
   - Switch to Test Mode

2. **Create Pro Plan Product:**
   - Go to Products → Add Product
   - Name: "TradeTimer Pro"
   - Price: $15/month
   - Save product

3. **Get Your Keys:**
   - Go to Developers → API Keys
   - Copy "Publishable key" → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Copy "Secret key" → `STRIPE_SECRET_KEY`
   - Copy Price ID from your product → `STRIPE_PRO_PRICE_ID`

4. **Set Up Webhook (for production):**
   - Go to Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Copy webhook secret → `STRIPE_WEBHOOK_SECRET`

### 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Testing the Features

### Test Settings:
1. Go to Profile page
2. Change timezone, date format, currency
3. Enable time rounding
4. Click "Save Settings"
5. Reload page to verify settings persist

### Test Time Entries:
1. Add some time entries from dashboard
2. Click "View All Entries →" at bottom of entries list
3. Try filtering by client, date range, amount
4. Try sorting by clicking column headers
5. Select entries and export to CSV

### Test Subscriptions (with Stripe test mode):
1. Go to Subscription page
2. Click "Upgrade to Pro"
3. Use test card: `4242 4242 4242 4242`
4. Any future date, any CVC
5. Complete checkout
6. Verify plan changed to Pro
7. Click "Manage Subscription" to test customer portal

---

## What's Working

✅ **Settings Page:**
- Display preferences (timezone, date/time formats, currency)
- Timer preferences (rounding, idle timeout, auto-start)
- Save/load from database

✅ **Time Entries Page:**
- View all entries with pagination
- Filter by client, date range, amount, notes
- Sort by any column
- Export to CSV
- Summary statistics

✅ **Stripe Integration:**
- Checkout flow
- Webhook handling
- Customer portal
- Subscription status tracking

✅ **Plan Limits:**
- Free plan: 1 client, 10 entries/month
- Pro plan: Unlimited
- Usage tracking

✅ **Subscription Page:**
- Current plan display
- Usage statistics with progress bars
- Upgrade/manage buttons
- Plan comparison

---

## What Still Needs Integration

### High Priority (Part 4):

1. **Apply Timer Settings:**
   - Load settings in Timer component
   - Apply time rounding when timer stops
   - Implement idle detection
   - Auto-start timer feature

2. **Projects UI:**
   - Create projects management page
   - Add project modal
   - Project dropdown in timer
   - Project dropdown in manual entry

3. **Project Reporting:**
   - Add project breakdown to reports
   - Budget utilization display
   - Over/under budget indicators

4. **Enforce Plan Limits:**
   - Check limits before adding client
   - Check limits before starting timer
   - Show upgrade prompt at limits

### Medium Priority:

5. **Format Utils Integration:**
   - Use formatDate/Time throughout app
   - Use formatCurrency in reports
   - Consistent formatting everywhere

6. **Saved Report Filters:**
   - Save filter button in reports
   - Load saved filters dropdown
   - Delete saved filters

7. **Report Enhancements:**
   - Comparison mode (current vs previous period)
   - Multi-client filter (checkboxes)

---

## Troubleshooting

### Settings not saving?
- Check Supabase table exists: `user_settings`
- Check browser console for errors
- Verify user is logged in

### Stripe checkout not working?
- Verify environment variables are set
- Check Stripe dashboard for errors
- Use test mode keys (pk_test_...)
- Try test card: 4242 4242 4242 4242

### Database migrations failing?
- Run migrations one at a time
- Check for syntax errors
- Verify auth.users table exists
- Check RLS is enabled on related tables

### Time entries page not loading?
- Check time_entries table has data
- Verify clients table is populated
- Check browser console for errors

---

## File Structure

```
lib/
├── format-utils.ts          # Date/time/currency formatting
├── projects.ts              # Projects CRUD functions
├── plan-limits.ts           # Plan limits and checks
├── stripe/
│   ├── config.ts           # Stripe configuration
│   ├── client.ts           # Client-side Stripe
│   └── server.ts           # Server-side Stripe

components/
├── settings/
│   ├── display-preferences.tsx
│   └── timer-preferences.tsx
├── time-entries/
│   └── time-entries-table.tsx
└── upgrade-prompt.tsx

app/
├── profile/page.tsx         # Settings page
├── time-entries/page.tsx    # All entries page
├── subscription/page.tsx    # Subscription management
└── api/stripe/
    ├── create-checkout/route.ts
    ├── create-portal/route.ts
    └── webhook/route.ts

supabase/migrations/
├── 20250102_create_projects.sql
├── 20250102_create_subscriptions.sql
└── 20250102_create_report_filters.sql
```

---

## Support

For issues or questions:
1. Check the main documentation: `docs/PART3_IMPLEMENTATION.md`
2. Review environment variables in `.env.example`
3. Check Supabase logs
4. Check Stripe dashboard logs
5. Check browser console for errors

---

## Next Steps

After Part 3 is set up and tested:
1. Move to Part 4 integration tasks
2. Integrate settings throughout the app
3. Build projects management UI
4. Add project-based reporting
5. Enforce plan limits with upgrade prompts

---

Good luck! 🚀
