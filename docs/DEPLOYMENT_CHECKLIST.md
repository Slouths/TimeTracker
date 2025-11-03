# TradeTimer Part 4 - Deployment Checklist

## Pre-Deployment Tasks

### 1. Install Dependencies ✅
```bash
npm install
```

**Verify all packages installed:**
- [x] resend
- [x] react-email
- [x] @react-email/components
- [x] @react-email/render
- [x] posthog-js
- [x] isomorphic-dompurify
- [x] @upstash/ratelimit
- [x] @upstash/redis
- [x] stripe
- [x] @stripe/stripe-js

---

### 2. Database Migration
Run in Supabase SQL Editor:

```sql
-- File location: supabase/migrations/part4-features.sql

-- This migration creates:
-- ✓ projects table
-- ✓ invoices table
-- ✓ referrals table
-- ✓ report_filters table
-- ✓ user_settings table
-- ✓ Adds project_id to time_entries table
```

**Verification:**
```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('projects', 'invoices', 'referrals', 'report_filters', 'user_settings');

-- Should return 5 rows
```

---

### 3. Environment Variables

#### Required (Must be set)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...
```

#### Optional but Recommended
```env
# Email (Resend)
RESEND_API_KEY=re_...
FROM_EMAIL=noreply@yourdomain.com

# Analytics (PostHog)
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Note:** Without optional services, those features will gracefully degrade:
- No Resend → Email sending disabled
- No PostHog → Analytics not tracked
- No Upstash → Rate limiting disabled

---

### 4. Create PWA Icons

Create two PNG files and place in `/public`:

**icon-192.png** (192x192 pixels)
- Square icon with brand color (#0369a1)
- Transparent or white background
- TradeTimer logo or "TT" monogram

**icon-512.png** (512x512 pixels)
- Same design as 192x192
- Higher resolution

**Tools:**
- Figma, Canva, or any design tool
- Online favicon generators
- https://realfavicongenerator.net/

---

### 5. Test Locally

```bash
# Development mode
npm run dev

# Production build test
npm run build
npm start
```

**Test these features:**
- [ ] Projects page loads (/projects)
- [ ] Create new project works
- [ ] Edit/delete project works
- [ ] Project budget calculation correct
- [ ] Navigation shows all links
- [ ] No console errors
- [ ] Analytics provider loads (check Network tab)
- [ ] PWA manifest accessible (/manifest.json)

---

## External Service Setup

### Resend (Email Service)

1. **Sign up:** https://resend.com
2. **Get API key:**
   - Dashboard → API Keys → Create API Key
   - Copy the key (starts with `re_`)
3. **Domain verification (Production):**
   - Dashboard → Domains → Add Domain
   - Add DNS records to your domain
   - Verify domain
4. **Update FROM_EMAIL:**
   - Development: `noreply@resend.dev` (default)
   - Production: `noreply@yourdomain.com`

**Free Tier Limits:**
- 100 emails/day
- 3,000 emails/month
- Suitable for initial launch

---

### PostHog (Analytics)

1. **Sign up:** https://posthog.com
2. **Create project:**
   - Dashboard → New Project → "TradeTimer"
3. **Get API key:**
   - Project Settings → Project Variables
   - Copy "Project API Key" (starts with `phc_`)
4. **Configure:**
   - Set `NEXT_PUBLIC_POSTHOG_KEY`
   - Set `NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com`

**Free Tier:**
- 1 million events/month
- Unlimited team members
- Perfect for getting started

---

### Upstash Redis (Rate Limiting)

1. **Sign up:** https://upstash.com
2. **Create database:**
   - Console → Create Database
   - Name: "tradetimer-ratelimit"
   - Region: Choose closest to your Vercel region
   - Type: Regional (free tier)
3. **Get credentials:**
   - Database → REST API → Copy REST URL
   - Copy REST Token
4. **Set environment variables:**
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`

**Free Tier:**
- 10,000 commands/day
- Sufficient for most use cases

---

## Vercel Deployment

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Part 4: Complete implementation with integrations"
git push origin main
```

### Step 2: Import to Vercel
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure project:
   - Framework: Next.js (auto-detected)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)

### Step 3: Add Environment Variables
In Vercel dashboard → Settings → Environment Variables

**Add all variables** from your `.env.local`:
- Paste variable name and value
- Select environments: Production, Preview, Development
- Click "Add"

**Critical:** Don't skip any required variables!

### Step 4: Deploy
- Click "Deploy"
- Wait for build to complete (~2-5 minutes)
- Check deployment logs for errors

---

## Post-Deployment Verification

### 1. Basic Functionality
- [ ] Site loads without errors
- [ ] User can sign up/login
- [ ] Dashboard displays correctly
- [ ] Timer works
- [ ] Time entries saved
- [ ] Clients can be added

### 2. Part 4 Features
- [ ] Projects page accessible
- [ ] Can create/edit projects
- [ ] Projects grouped by client
- [ ] Budget progress bars working
- [ ] Navigation shows all links

### 3. Integrations
- [ ] Send test email (if Resend configured)
  - Go to future invoice generation
  - Check email delivery
- [ ] Analytics events tracked (if PostHog configured)
  - Open PostHog dashboard
  - Check for events appearing
- [ ] Rate limiting active (if Upstash configured)
  - Make 10+ rapid requests to API
  - Should see 429 errors

### 4. PWA
- [ ] Manifest accessible: `https://yourdomain.com/manifest.json`
- [ ] Theme color applied in mobile browser
- [ ] Install prompt appears (mobile)
- [ ] Icons display correctly

### 5. Performance
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90 (Performance)
- [ ] No console errors in production
- [ ] No TypeScript errors in build

---

## Common Deployment Issues

### Build Fails
**Error:** "Module not found"
- **Fix:** Run `npm install` to ensure all dependencies installed
- Check `package.json` for missing packages
- Clear `.next` folder and rebuild

### Environment Variables Not Working
**Error:** Undefined env vars in production
- **Fix:** Ensure variables set in Vercel dashboard
- Prefix browser variables with `NEXT_PUBLIC_`
- Redeploy after adding variables

### Database Errors
**Error:** "relation does not exist"
- **Fix:** Run Part 4 migration in Supabase
- Check RLS policies are enabled
- Verify user authentication working

### Email Not Sending
**Error:** Email API returns 500
- **Fix:** Check Resend API key is valid
- Verify domain is verified (production)
- Check rate limits not exceeded
- Look at Vercel function logs

### Analytics Not Tracking
**Error:** Events not appearing in PostHog
- **Fix:** Verify PostHog key is correct
- Check Analytics Provider is wrapping app
- Ensure user hasn't opted out
- Check browser console for PostHog errors

---

## Security Checklist

- [ ] All environment variables in Vercel (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] Supabase RLS policies enabled
- [ ] Rate limiting configured
- [ ] Input sanitization applied
- [ ] HTTPS only (Vercel provides by default)
- [ ] Webhook secrets configured (Stripe)

---

## Performance Optimization

### After Initial Deployment

1. **Enable Caching:**
   - Vercel Edge Network (automatic)
   - Configure ISR for static pages

2. **Optimize Images:**
   - Use Next.js Image component
   - Compress PWA icons
   - WebP format where possible

3. **Monitor Performance:**
   - Vercel Analytics (free tier)
   - PostHog session recordings
   - Google PageSpeed Insights

---

## Monitoring & Alerts

### Set Up Monitoring

1. **Vercel:**
   - Dashboard → Analytics
   - Monitor function execution time
   - Check error rates

2. **PostHog:**
   - Create dashboards for:
     - Daily active users
     - Feature usage (timer starts, projects created)
     - Error rates

3. **Resend:**
   - Monitor email delivery rates
   - Check bounce rates
   - Watch for spam reports

### Alerts to Configure

- [ ] Function timeout alerts (Vercel)
- [ ] Error rate threshold (>5% errors)
- [ ] Email delivery failures
- [ ] Database connection issues

---

## Rollback Plan

If deployment fails or critical issues found:

### Quick Rollback (Vercel)
1. Go to Vercel dashboard
2. Deployments → Previous deployment
3. Click "..." → "Promote to Production"
4. Confirm rollback

### Database Rollback
```sql
-- If needed, rollback Part 4 migration
-- (Not recommended unless critical issue)

DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.referrals CASCADE;
DROP TABLE IF EXISTS public.report_filters CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

ALTER TABLE public.time_entries
DROP COLUMN IF EXISTS project_id;
```

**Warning:** This will delete all Part 4 data!

---

## Launch Communication

### To Users (if applicable)

**New Features Announcement:**
- Projects management for better organization
- Enhanced export options (QuickBooks, Xero)
- Improved mobile experience (PWA)
- Performance improvements

**How to Update (PWA users):**
- Mobile: Refresh app
- Desktop: Hard refresh (Ctrl+Shift+R)

---

## Support Resources

### Documentation
- [Part 4 Implementation Guide](./PART4_IMPLEMENTATION_GUIDE.md)
- [Part 4 Summary](./PART4_SUMMARY.md)
- [README](./README.md)

### External Docs
- [Vercel Deployment](https://nextjs.org/docs/deployment)
- [Supabase Migrations](https://supabase.com/docs/guides/database/migrations)
- [Resend Docs](https://resend.com/docs)
- [PostHog Docs](https://posthog.com/docs)
- [Upstash Docs](https://docs.upstash.com/)

### Getting Help
1. Check deployment logs in Vercel
2. Review Supabase logs
3. Check browser console errors
4. Refer to documentation above
5. Contact development team

---

## Success Criteria

Deployment is successful when:
- ✅ All pages load without errors
- ✅ Users can sign up and login
- ✅ Timer and time tracking works
- ✅ Projects can be created and managed
- ✅ Reports generate correctly
- ✅ No critical console errors
- ✅ PWA install works on mobile
- ✅ Email sending functional (if configured)
- ✅ Analytics tracking events (if configured)
- ✅ Lighthouse score > 85

---

## Post-Launch Tasks

### Week 1
- [ ] Monitor error rates daily
- [ ] Check email delivery rates
- [ ] Review PostHog analytics
- [ ] Gather user feedback
- [ ] Fix any critical bugs

### Week 2
- [ ] Implement remaining Part 4 features (bulk ops, enhanced reports)
- [ ] Optimize performance based on metrics
- [ ] Add PWA icons if not done
- [ ] Configure domain email (Resend)

### Month 1
- [ ] Review analytics dashboards
- [ ] Analyze user behavior
- [ ] Plan next features
- [ ] Optimize based on usage patterns

---

**Deployment Date:** _________________
**Deployed By:** _________________
**Production URL:** _________________
**Status:** ⬜ Pending | ⬜ In Progress | ⬜ Complete

---

**Last Updated:** November 2, 2025
**Version:** 1.0.0
