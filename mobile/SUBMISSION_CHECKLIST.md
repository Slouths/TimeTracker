# App Store Submission Checklist

Complete step-by-step checklist for submitting TradeTimer to Apple App Store and Google Play Store.

---

## Pre-Submission Preparation

### Development Complete
- [ ] All core features implemented and working
- [ ] All screens designed and polished
- [ ] No placeholder content or Lorem Ipsum text
- [ ] No debug code or console logs in production
- [ ] Error handling implemented throughout
- [ ] Loading states and empty states designed
- [ ] App tested thoroughly on multiple devices

### Environment Configuration
- [ ] Production environment variables configured
- [ ] API endpoints pointing to production servers
- [ ] Analytics keys configured (PostHog, Sentry)
- [ ] Stripe publishable key (production mode)
- [ ] Remove all test/development keys
- [ ] Supabase production credentials set

### Code Quality
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] No ESLint errors or warnings
- [ ] Code formatted and consistent
- [ ] Unused imports removed
- [ ] Unused files deleted
- [ ] Bundle size optimized

### Testing Complete
- [ ] All features tested on iOS (physical device)
- [ ] All features tested on Android (physical device)
- [ ] Timer functionality works correctly
- [ ] Client CRUD operations work
- [ ] Time entry management works
- [ ] Reports display correctly
- [ ] Settings and preferences work
- [ ] Authentication and logout work
- [ ] Biometric authentication tested
- [ ] Offline mode tested
- [ ] Data sync tested
- [ ] No crashes or major bugs
- [ ] Performance acceptable (no lag)

### Legal & Compliance
- [ ] Privacy policy written and published
- [ ] Privacy policy URL accessible: https://tradetimer.com/privacy
- [ ] Terms of Service written (if needed)
- [ ] Support email configured: support@tradetimer.com
- [ ] Support website ready: https://tradetimer.com/support
- [ ] App complies with platform guidelines
- [ ] No intellectual property violations
- [ ] Export compliance determined (iOS)

---

## Account Setup

### Apple Developer Account
- [ ] Enrolled in Apple Developer Program ($99/year paid)
- [ ] Account approved and active
- [ ] Two-factor authentication enabled
- [ ] App Store Connect access verified
- [ ] Agreements accepted in App Store Connect
- [ ] Banking and tax information completed (if selling)

### Google Play Console Account
- [ ] Developer account created ($25 one-time paid)
- [ ] Account verified and active
- [ ] Identity verification completed (if required)
- [ ] Developer Distribution Agreement accepted
- [ ] Payment profile set up (if selling)
- [ ] Tax information completed

### Expo/EAS Account
- [ ] Expo account created
- [ ] EAS CLI installed: `npm install -g eas-cli`
- [ ] Logged into EAS: `eas login`
- [ ] Project initialized: `eas init`
- [ ] Project ID added to app.json

---

## App Configuration

### app.json Configuration
- [ ] App name set: "TradeTimer - Time Tracking"
- [ ] Version number set: "1.0.0"
- [ ] Bundle identifier: "com.tradetimer.app"
- [ ] Package name: "com.tradetimer.app"
- [ ] iOS build number set: "1"
- [ ] Android version code set: 1
- [ ] Expo project ID configured
- [ ] Privacy descriptions added (iOS)
- [ ] Permissions declared (Android)
- [ ] Export compliance set (iOS)
- [ ] Adaptive icon configured (Android)
- [ ] Splash screen configured

### eas.json Configuration
- [ ] eas.json file created
- [ ] Build profiles configured (development, preview, production)
- [ ] iOS build settings correct
- [ ] Android build settings correct (AAB)
- [ ] Environment variables set
- [ ] Submit configuration added (optional)

---

## Store Assets

### App Icons
- [ ] iOS app icon created (1024x1024 PNG, no transparency)
- [ ] Android app icon created (512x512 PNG)
- [ ] Android adaptive icon created (1024x1024 PNG with transparency)
- [ ] Icons tested on actual devices
- [ ] Icons follow platform guidelines
- [ ] No copyrighted or trademarked content

### Screenshots

#### iOS Screenshots
- [ ] iPhone 6.7" (1290 x 2796) - minimum 3 screenshots
- [ ] iPhone 6.5" (1242 x 2688) - minimum 3 screenshots
- [ ] iPhone 5.5" (1242 x 2208) - if supporting older devices
- [ ] iPad Pro 12.9" (2048 x 2732) - if supporting iPad
- [ ] Screenshots show real app content
- [ ] Screenshots are high quality
- [ ] Captions added (optional but recommended)

#### Android Screenshots
- [ ] Phone screenshots (1080 x 1920 minimum) - 2-8 screenshots
- [ ] 7" tablet screenshots (optional)
- [ ] 10" tablet screenshots (optional)
- [ ] Feature graphic created (1024 x 500)
- [ ] Screenshots show real app content
- [ ] High quality images

### App Previews/Videos (Optional)
- [ ] App preview video created (iOS, 15-30 seconds)
- [ ] Promo video created (Android, YouTube upload)
- [ ] Videos show key features
- [ ] Professional quality
- [ ] No copyrighted music or content

### Store Descriptions
- [ ] App Store description written (see store-assets/app-store-listing.md)
- [ ] Play Store description written (see store-assets/play-store-listing.md)
- [ ] Keywords researched and optimized
- [ ] Descriptions proofread for errors
- [ ] Descriptions highlight key features
- [ ] Call-to-action included

---

## Apple App Store

### App Store Connect Setup
- [ ] App created in App Store Connect
- [ ] App name available and set
- [ ] Bundle ID registered
- [ ] SKU assigned
- [ ] Primary language set (English)

### App Information
- [ ] Name: "TradeTimer - Time Tracking"
- [ ] Subtitle: "Track time, invoice clients"
- [ ] Privacy policy URL: https://tradetimer.com/privacy
- [ ] Primary category: Business
- [ ] Secondary category: Productivity
- [ ] Age rating completed (should be 4+)

### Pricing and Availability
- [ ] Price set to Free
- [ ] Countries/regions selected
- [ ] Availability date set
- [ ] Pre-orders configured (if applicable)

### Version Information (1.0)
- [ ] Screenshots uploaded (all required sizes)
- [ ] Promotional text added (optional)
- [ ] Description added (4000 chars max)
- [ ] Keywords added (100 chars max)
- [ ] Support URL: https://tradetimer.com/support
- [ ] Marketing URL: https://tradetimer.com (optional)
- [ ] Copyright: 2025 TradeTimer

### App Review Information
- [ ] Contact first name entered
- [ ] Contact last name entered
- [ ] Contact phone number entered
- [ ] Contact email entered
- [ ] Demo account created for reviewers
- [ ] Demo account credentials provided:
  - Username: review@tradetimer.com
  - Password: [provided in form]
- [ ] Demo account has sample data
- [ ] Review notes added explaining features
- [ ] Attachments added (if needed)

### Build Upload
- [ ] Production build created: `eas build --platform ios --profile production`
- [ ] Build completed successfully
- [ ] Build appears in TestFlight
- [ ] Build processing completed
- [ ] Build selected in version information
- [ ] Export compliance answered (No encryption)

### Submission
- [ ] All information reviewed
- [ ] All required fields completed
- [ ] No errors or warnings
- [ ] Screenshots preview looks good
- [ ] "Add for Review" clicked
- [ ] Final review completed
- [ ] "Submit to App Review" clicked
- [ ] Confirmation email received

### Post-Submission (iOS)
- [ ] Status changed to "Waiting for Review"
- [ ] Review status monitored daily
- [ ] Ready to respond to reviewer questions (within 24 hours)
- [ ] Prepare for potential rejection
- [ ] Plan release strategy (automatic/manual)

---

## Google Play Store

### Play Console Setup
- [ ] App created in Play Console
- [ ] App name set: "TradeTimer - Time Tracking & Invoicing"
- [ ] Default language: English (United States)
- [ ] App type: App (not game)
- [ ] Free or paid: Free
- [ ] Declarations accepted

### Store Listing
- [ ] App name: "TradeTimer - Time Tracking & Invoicing"
- [ ] Short description (80 chars): Written and added
- [ ] Full description (4000 chars): Written and added
- [ ] App icon uploaded (512x512)
- [ ] Feature graphic uploaded (1024x500)
- [ ] Phone screenshots uploaded (2-8 screenshots)
- [ ] Tablet screenshots uploaded (optional)
- [ ] Promo video URL added (optional)
- [ ] App category: Business
- [ ] Tags added (up to 5)
- [ ] Email: support@tradetimer.com
- [ ] Phone number added (optional)
- [ ] Website: https://tradetimer.com

### Store Settings
- [ ] App category: Business
- [ ] Tags selected (Business, Productivity, etc.)
- [ ] Store presence completed

### App Content

#### Privacy Policy
- [ ] Privacy policy URL: https://tradetimer.com/privacy
- [ ] Privacy policy accessible and complete

#### App Access
- [ ] Access type selected: "Some functionality restricted"
- [ ] Test account credentials provided:
  - Email: review@tradetimer.com
  - Password: [provided]
- [ ] Instructions for reviewers added
- [ ] Demo account has sample data

#### Ads
- [ ] Declared: No ads in app

#### Content Rating
- [ ] Content rating questionnaire started
- [ ] Email address provided
- [ ] Category selected
- [ ] All questions answered honestly:
  - Violence: No
  - Sexual content: No
  - Profanity: No
  - Controlled substances: No
  - Hate speech: No
  - Gambling: No
- [ ] Rating calculated (should be "Everyone")
- [ ] Rating submitted

#### Target Audience
- [ ] Age groups selected: 18 and over
- [ ] Target audience saved

#### News Apps
- [ ] Declared: Not a news app

#### COVID-19
- [ ] Declared: Not a COVID-19 app

#### Data Safety
- [ ] Data safety form started
- [ ] Data collection declared: Yes
- [ ] Data types selected:
  - Personal info (name, email)
  - Financial info (payment)
  - App activity
  - App info and performance
- [ ] Data usage explained
- [ ] Data handling declared:
  - Encrypted in transit: Yes
  - Encrypted at rest: Yes
  - Can request deletion: Yes
  - Not shared with third parties: Yes (except Stripe)
- [ ] Form submitted and approved

### Release - Internal Testing (Recommended)
- [ ] Internal testing track created
- [ ] Release name: 1.0.0 (Internal)
- [ ] Release notes added
- [ ] Android build created: `eas build --platform android --profile production`
- [ ] AAB file downloaded
- [ ] AAB uploaded to Play Console
- [ ] Processing completed without errors
- [ ] Testers added (email list)
- [ ] Release reviewed
- [ ] Rollout started to internal testing
- [ ] App installed and tested by testers
- [ ] All features tested
- [ ] No critical bugs found
- [ ] Feedback incorporated

### Release - Production
- [ ] Production release created
- [ ] Release name: 1.0.0
- [ ] Release notes written:
  ```
  Welcome to TradeTimer!

  • One-tap time tracking
  • Client management
  • Professional reports
  • Invoice generation
  • Biometric security
  • Offline support
  ```
- [ ] AAB uploaded (same as internal testing or new build)
- [ ] Processing completed
- [ ] Countries/regions selected (All or specific)
- [ ] Release reviewed for compliance
- [ ] No policy violations
- [ ] All required sections completed
- [ ] "Review release" clicked
- [ ] "Start rollout to Production" clicked
- [ ] Confirmation received

### Post-Submission (Android)
- [ ] Status: "Pending publication"
- [ ] Review monitored daily
- [ ] Ready to respond to policy questions
- [ ] Prepare for potential rejection
- [ ] Monitor first reviews and ratings

---

## Build Commands Reference

### iOS Production Build
```bash
cd mobile
eas build --platform ios --profile production
```

### Android Production Build
```bash
cd mobile
eas build --platform android --profile production
```

### Build Both Platforms
```bash
cd mobile
eas build --platform all --profile production
```

### Submit to App Store (after build)
```bash
eas submit --platform ios --latest
```

### Submit to Play Store (after build)
```bash
eas submit --platform android --latest
```

---

## Common Pre-Submission Issues

### Issue: App Crashes on Launch
- [ ] Test on physical device
- [ ] Check crash logs in Sentry
- [ ] Fix critical bugs before submission
- [ ] Verify all dependencies installed

### Issue: Missing Assets
- [ ] All icons created and in correct paths
- [ ] All screenshots prepared
- [ ] Feature graphic created (Android)
- [ ] No broken image references

### Issue: Environment Variables Not Set
- [ ] Check .env file
- [ ] Verify production keys
- [ ] Test API connections
- [ ] Confirm Supabase connection

### Issue: Bundle Identifier Mismatch
- [ ] app.json bundle ID matches App Store Connect
- [ ] app.json package name matches Play Console
- [ ] No typos in identifiers

### Issue: Version Numbers Not Updated
- [ ] Increment version for each submission
- [ ] Increment build number (iOS)
- [ ] Increment version code (Android)
- [ ] Update release notes

---

## Test Account Setup

Create a dedicated test account for reviewers:

**Email:** review@tradetimer.com
**Password:** ReviewTest2024! (use secure password)

**Test Account Setup:**
- [ ] Account created in production database
- [ ] Email verified
- [ ] Pro subscription activated (for testing paid features)
- [ ] Sample clients added (3-5 clients with different rates)
- [ ] Sample time entries added (10-20 entries)
- [ ] Sample invoices generated
- [ ] All features accessible
- [ ] No restrictions or limitations
- [ ] Test credentials verified working

---

## Final Pre-Launch Checklist

### 24 Hours Before Launch
- [ ] All builds uploaded and processing complete
- [ ] All store listings complete and proofread
- [ ] Test accounts verified working
- [ ] Support email monitored
- [ ] Team briefed on launch
- [ ] Marketing materials ready
- [ ] Social media posts scheduled
- [ ] Press release prepared (if applicable)

### Launch Day
- [ ] Monitor review status
- [ ] Check email for reviewer questions
- [ ] Respond to inquiries within 24 hours
- [ ] Monitor crash reports
- [ ] Check analytics setup
- [ ] Prepare to respond to first reviews
- [ ] Social media announcement ready

### Post-Launch (First Week)
- [ ] Monitor reviews daily
- [ ] Respond to user feedback
- [ ] Track downloads and installs
- [ ] Monitor crash rates
- [ ] Check performance metrics
- [ ] Address critical bugs immediately
- [ ] Plan first update based on feedback

---

## Troubleshooting

### If iOS App Rejected
1. Read rejection reason carefully
2. Fix the specific issues mentioned
3. Reply to reviewer if clarification needed
4. Upload new build if code changes required
5. Or resubmit same build if metadata issue
6. Monitor resubmission status

### If Android App Rejected
1. Review policy violation details
2. Fix issues in app or listing
3. Upload new build if needed
4. Update store listing if needed
5. Resubmit for review
6. Consider appealing if rejection seems incorrect

### If Build Fails
1. Check build logs: `eas build:list`
2. View specific build: `eas build:view [id]`
3. Common fixes:
   - Clear cache: `--clear-cache`
   - Update dependencies: `npm install`
   - Check TypeScript errors
   - Verify credentials

---

## Success Criteria

Your app is ready for submission when:

- ✅ All features working perfectly
- ✅ No crashes or critical bugs
- ✅ All store assets created
- ✅ All accounts set up and verified
- ✅ Privacy policy published
- ✅ Test account configured
- ✅ All checklists completed
- ✅ Builds uploaded successfully
- ✅ All store listings complete
- ✅ Ready to respond to reviewers

---

## Resources

- **Apple App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policy Center:** https://play.google.com/about/developer-content-policy/
- **EAS Build Documentation:** https://docs.expo.dev/build/introduction/
- **EAS Submit Documentation:** https://docs.expo.dev/submit/introduction/
- **Full Deployment Guide:** See `docs/APP_STORE_DEPLOYMENT.md`

---

**Last Updated:** November 3, 2025

Good luck with your submission! 🚀
