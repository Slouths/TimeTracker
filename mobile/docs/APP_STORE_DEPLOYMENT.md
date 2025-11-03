# App Store Deployment Guide - TradeTimer

Complete guide for deploying TradeTimer to Apple App Store and Google Play Store.

**Last Updated:** November 2025
**App Version:** 1.0.0

---

## Table of Contents

1. [Prerequisites Checklist](#prerequisites-checklist)
2. [Account Setup](#account-setup)
3. [Preparing Your App](#preparing-your-app)
4. [Apple App Store Submission](#apple-app-store-submission)
5. [Google Play Store Submission](#google-play-store-submission)
6. [EAS Build Configuration](#eas-build-configuration)
7. [Store Assets Requirements](#store-assets-requirements)
8. [Testing Before Submission](#testing-before-submission)
9. [Post-Submission](#post-submission)
10. [Common Issues & Solutions](#common-issues--solutions)

---

## Prerequisites Checklist

Before starting the deployment process, ensure you have:

### Required Accounts
- [ ] **Apple Developer Account** ($99/year)
  - Visit: https://developer.apple.com/programs/
  - Required for TestFlight and App Store distribution
  - Enrollment takes 24-48 hours
- [ ] **Google Play Console Account** ($25 one-time)
  - Visit: https://play.google.com/console/signup
  - Required for Google Play Store distribution
  - Account verification can take 24-48 hours
- [ ] **Expo Account** (Free)
  - Visit: https://expo.dev/signup
  - Required for EAS Build and Submit

### Development Environment
- [ ] **macOS Computer** (for iOS builds and submission)
  - Xcode 15.0 or later installed
  - Command Line Tools installed: `xcode-select --install`
  - macOS Sonoma or later recommended
- [ ] **Node.js 18+** installed
- [ ] **EAS CLI** installed globally: `npm install -g eas-cli`
- [ ] **Expo CLI** installed globally: `npm install -g expo-cli`

### App Assets
- [ ] **App Icon** designed (1024x1024px PNG)
- [ ] **Screenshots** prepared for all required device sizes
- [ ] **Feature Graphic** (Android - 1024x500px)
- [ ] **Privacy Policy** published on accessible URL
- [ ] **Support URL** or email configured
- [ ] **App Description** written (see templates in store-assets/)
- [ ] **Keywords** researched (100 characters max for iOS)
- [ ] **Promotional Materials** (optional but recommended)

### Legal & Compliance
- [ ] Privacy policy reviewed and published
- [ ] Terms of Service prepared (if applicable)
- [ ] App complies with platform guidelines
- [ ] Content rating questionnaire completed
- [ ] Export compliance determined (for iOS)

---

## Account Setup

### Apple Developer Program

1. **Enroll in Apple Developer Program:**
   - Go to: https://developer.apple.com/programs/enroll/
   - Sign in with your Apple ID
   - Choose Individual or Organization
   - Complete payment ($99/year)
   - Wait for approval (24-48 hours)

2. **Access App Store Connect:**
   - Go to: https://appstoreconnect.apple.com/
   - Sign in with your Apple Developer account
   - Accept any agreements

3. **Set Up Two-Factor Authentication:**
   - Required for App Store Connect access
   - Configure at: https://appleid.apple.com/

### Google Play Console

1. **Create Developer Account:**
   - Go to: https://play.google.com/console/signup
   - Sign in with your Google account
   - Pay one-time registration fee ($25)
   - Complete account details
   - Accept Developer Distribution Agreement

2. **Verify Your Identity:**
   - Google may require ID verification
   - Submit required documents
   - Wait for verification (24-48 hours)

3. **Set Up Payment Profile:**
   - Configure merchant account (for paid apps)
   - Add payment methods
   - Complete tax information

### Expo Account Setup

1. **Create Expo Account:**
   ```bash
   # Login to Expo
   eas login

   # Or create new account
   eas register
   ```

2. **Initialize EAS in Your Project:**
   ```bash
   cd mobile
   eas init
   ```

   This will:
   - Create an EAS project
   - Generate a project ID
   - Update app.json with project ID

---

## Preparing Your App

### 1. Update app.json Configuration

Ensure your `app.json` has all required fields:

```json
{
  "expo": {
    "name": "TradeTimer - Time Tracking",
    "slug": "tradetimer",
    "version": "1.0.0",
    "owner": "your-expo-username",
    "privacy": "unlisted",

    "ios": {
      "bundleIdentifier": "com.tradetimer.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "icon": "./src/assets/icon.png",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID to securely login to your TradeTimer account",
        "NSCameraUsageDescription": "Take photos for time entry notes (optional feature)",
        "NSPhotoLibraryUsageDescription": "Select photos for time entry notes (optional feature)"
      },
      "config": {
        "usesNonExemptEncryption": false
      }
    },

    "android": {
      "package": "com.tradetimer.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/adaptive-icon.png",
        "backgroundColor": "#0369a1"
      },
      "permissions": [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "VIBRATE"
      ]
    }
  }
}
```

### 2. Create App Icons

**iOS App Icon:**
- Size: 1024x1024 pixels
- Format: PNG (no transparency)
- Path: `mobile/src/assets/icon.png`

**Android Adaptive Icon:**
- Foreground: 1024x1024 pixels (can have transparency)
- Background color: `#0369a1`
- Path: `mobile/src/assets/adaptive-icon.png`

**Design Guidelines:**
- Keep design simple and recognizable at small sizes
- Avoid text in icons (poor readability)
- Use TradeTimer branding colors
- Test on actual devices

### 3. Prepare Screenshots

See [Store Assets Requirements](#store-assets-requirements) for detailed specifications.

**Tips for Great Screenshots:**
- Show key features in action
- Use real data (not placeholder text)
- Highlight unique selling points
- Add captions or annotations
- Maintain consistent style
- Consider localization

### 4. Environment Variables

Ensure all production environment variables are configured:

```bash
# .env.production (do NOT commit to git)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
EXPO_PUBLIC_POSTHOG_KEY=your-posthog-key
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn
EXPO_PUBLIC_ENV=production
```

### 5. Test Production Build Locally

Before submitting, test a production build:

```bash
# iOS local build
eas build --profile production --platform ios --local

# Android local build
eas build --profile production --platform android --local
```

Install and test thoroughly on physical devices.

---

## Apple App Store Submission

### Step 1: Create App in App Store Connect

1. **Go to App Store Connect:**
   - Visit: https://appstoreconnect.apple.com/
   - Click "My Apps"
   - Click "+" button → "New App"

2. **Fill in App Information:**
   - **Platforms:** iOS
   - **Name:** TradeTimer - Time Tracking
   - **Primary Language:** English (U.S.)
   - **Bundle ID:** com.tradetimer.app (must match app.json)
   - **SKU:** tradetimer-ios-001 (unique identifier)
   - **User Access:** Full Access

3. **Click "Create"**

### Step 2: Complete App Information

#### App Information Tab

1. **Basic Information:**
   - **Name:** TradeTimer - Time Tracking (30 chars max)
   - **Subtitle:** Track time, invoice clients (30 chars max)
   - **Privacy Policy URL:** https://tradetimer.com/privacy
   - **Category:**
     - Primary: Business
     - Secondary: Productivity

2. **Age Rating:**
   - Click "Edit"
   - Complete questionnaire (should be 4+)
   - Save

#### Pricing and Availability

1. **Price Schedule:**
   - Select "Free" (app is free to download)

2. **Availability:**
   - **Countries:** Select all countries or specific regions
   - **App Distribution:** Public

3. **Pre-orders:** (Optional)
   - Set pre-order date if desired

### Step 3: Prepare Version Information

Navigate to "iOS App" → "1.0 Prepare for Submission"

#### Screenshots and App Previews

Upload screenshots for ALL required device sizes:

**iPhone 6.7" Display** (iPhone 14 Pro Max, 15 Pro Max)
- Resolution: 1290 x 2796 pixels
- Minimum: 3 screenshots, Maximum: 10
- File format: PNG or JPG

**iPhone 6.5" Display** (iPhone 11 Pro Max, XS Max)
- Resolution: 1242 x 2688 pixels
- Minimum: 3 screenshots, Maximum: 10

**iPhone 5.5" Display** (iPhone 8 Plus)
- Resolution: 1242 x 2208 pixels
- Required if supporting older devices

**iPad Pro 12.9" Display** (3rd gen)
- Resolution: 2048 x 2732 pixels
- Required if "supportsTablet": true

**App Previews:** (Optional but recommended)
- Video previews up to 30 seconds
- Shows app in action
- Higher conversion rates

#### Promotional Text (Optional)
170 characters max, can be updated without new app review:
```
Stop losing money on untracked hours. The simplest way to track billable time and get paid faster. Free trial available!
```

#### Description
4000 characters max (see `store-assets/app-store-listing.md`):

```
Stop losing money on untracked hours. TradeTimer is the simplest way to track billable time and get paid faster.

PERFECT FOR:
• Freelancers & Consultants
• Independent Contractors
• Small Business Owners
• Hourly Workers

KEY FEATURES:

⏱️ One-Tap Time Tracking
Start and stop timer instantly. Track time by client and project with automatic earnings calculations.

💼 Client Management
Store client details and rates. Unlimited clients with Pro plan. Quick client switching.

📊 Professional Reports
View earnings summaries and time breakdowns by client. Export to CSV/PDF for your records.

💰 Invoice Generation
Create professional PDF invoices with one tap. Email invoices directly to clients.

🔒 Secure & Private
Biometric authentication (Face ID / Touch ID). Encrypted data storage. Your data stays private.

🎯 Smart Features
• Pause and resume timer
• Idle time detection
• Time rounding options
• Offline mode support
• Haptic feedback
• Pull-to-refresh

WHY TRADETIMER?
Built specifically for people who bill by the hour. No complicated features you don't need. Just simple, fast time tracking that helps you capture every billable minute.

PRICING:
• Free: 1 client, 10 entries/month
• Pro ($15/month): Unlimited everything

Start your free trial today!
```

#### Keywords
100 characters max (separated by commas):
```
time,tracker,invoice,freelance,billable,hours,timesheet,consultant,contractor
```

**Keyword Tips:**
- Research using App Store Connect analytics
- Use tools like AppTweak or Sensor Tower
- Avoid brand names (Apple rejects)
- Focus on high-traffic, relevant terms

#### Support URL
```
https://tradetimer.com/support
```

#### Marketing URL (Optional)
```
https://tradetimer.com
```

### Step 4: App Review Information

This information helps Apple reviewers test your app:

1. **Contact Information:**
   - **First Name:** Your Name
   - **Last Name:** Your Last Name
   - **Phone Number:** +1-XXX-XXX-XXXX
   - **Email:** support@tradetimer.com

2. **Demo Account:**
   If your app requires login (TradeTimer does), provide test credentials:
   ```
   Username: review@tradetimer.com
   Password: ReviewTest2024!
   ```

   **Important:** Create a dedicated test account with:
   - Sample clients added
   - Sample time entries
   - All features accessible
   - No restrictions

3. **Notes:**
   ```
   TradeTimer is a time tracking app for freelancers and contractors.

   Test Account Details:
   - Email: review@tradetimer.com
   - Password: ReviewTest2024!

   Key features to test:
   1. Timer - Tap "Start Timer" to begin tracking time
   2. Clients - View pre-configured test clients
   3. Time Entries - View tracked time entries
   4. Reports - View earnings summaries

   The app uses biometric authentication (Face ID/Touch ID) which can be
   disabled in Settings for testing purposes.
   ```

4. **Attachment:** (If needed)
   - Upload demo video or additional documentation
   - Maximum 500 MB

### Step 5: Version Information

1. **Copyright:**
   ```
   2025 TradeTimer
   ```

2. **Trade Representative Contact Information:**
   - Required for Korean App Store
   - Skip if not distributing in Korea

3. **Routing App Coverage File:**
   - Not applicable for TradeTimer

### Step 6: Build Submission

1. **Build the App with EAS:**
   ```bash
   cd mobile
   eas build --platform ios --profile production
   ```

   Wait for build to complete (~10-20 minutes). You'll get an email when done.

2. **Verify Build in App Store Connect:**
   - Builds appear under "TestFlight" → "iOS Builds"
   - Wait for "Processing" to complete (~5-10 minutes)
   - Build will then appear in "App Store" section

3. **Select Build:**
   - In "Prepare for Submission", scroll to "Build"
   - Click "+" to add build
   - Select the build version you just created

4. **Export Compliance:**
   - Does your app use encryption? **No**
   - (We already set `usesNonExemptEncryption: false` in app.json)

### Step 7: Submit for Review

1. **Review All Information:**
   - Check all fields are filled correctly
   - Preview screenshots on all device sizes
   - Test demo account credentials

2. **Click "Add for Review"** (top right)

3. **Submit App:**
   - Review summary
   - Click "Submit to App Review"

4. **Confirmation:**
   - You'll receive email confirmation
   - Status changes to "Waiting for Review"

### Step 8: Review Process

**Timeline:**
- **Typical:** 24-48 hours
- **During holidays:** Up to 5-7 days
- **Expedited review:** Available for critical updates (use sparingly)

**Status Updates:**
- **Waiting for Review:** In queue
- **In Review:** Currently being reviewed (can take 1-24 hours)
- **Pending Developer Release:** Approved! You can release manually
- **Ready for Sale:** Live on App Store
- **Rejected:** See rejection reasons and resubmit

**If Rejected:**
1. Read rejection reason carefully
2. Fix the issues
3. Reply to reviewer if needed
4. Submit new build or resubmit

### Step 9: Release

Once approved:

**Option 1: Automatic Release**
- App goes live immediately after approval

**Option 2: Manual Release**
- Choose "Manually release this version"
- Click "Release This Version" when ready

**Option 3: Scheduled Release**
- Set specific date and time
- App releases automatically

---

## Google Play Store Submission

### Step 1: Create App in Play Console

1. **Go to Google Play Console:**
   - Visit: https://play.google.com/console/
   - Click "Create app"

2. **App Details:**
   - **App name:** TradeTimer - Time Tracking & Invoicing
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free

3. **Declarations:**
   - [ ] I confirm this app complies with Google Play policies
   - [ ] I confirm this app complies with US export laws

4. **Click "Create app"**

### Step 2: Set Up Your App

Complete all required sections in the Dashboard:

#### Dashboard Overview

The Play Console requires you to complete these sections before publishing:
1. Store presence (Store listing, Store settings)
2. Content (App content, Ads, News apps)
3. Release (Production, Testing)

### Step 3: Store Listing

Navigate to "Store presence" → "Main store listing"

#### App Details

1. **App name:**
   ```
   TradeTimer - Time Tracking & Invoicing
   ```
   (50 characters maximum)

2. **Short description:**
   ```
   Track billable hours, manage clients, generate invoices. Simple time tracking.
   ```
   (80 characters maximum)

3. **Full description:**
   ```
   Stop losing money on untracked hours. TradeTimer is the simplest way to track billable time and get paid faster.

   PERFECT FOR:
   • Freelancers & Consultants
   • Independent Contractors
   • Small Business Owners
   • Hourly Workers

   KEY FEATURES:

   ⏱️ ONE-TAP TIME TRACKING
   Start and stop timer instantly. Track time by client and project with automatic earnings calculations.

   💼 CLIENT MANAGEMENT
   Store client details and rates. Unlimited clients with Pro plan. Quick client switching.

   📊 PROFESSIONAL REPORTS
   View earnings summaries and time breakdowns by client. Export to CSV/PDF for your records.

   💰 INVOICE GENERATION
   Create professional PDF invoices with one tap. Email invoices directly to clients.

   🔒 SECURE & PRIVATE
   Biometric authentication (fingerprint / face unlock). Encrypted data storage. Your data stays private.

   🎯 SMART FEATURES
   • Pause and resume timer
   • Idle time detection
   • Time rounding options
   • Offline mode support
   • Haptic feedback
   • Pull-to-refresh

   WHY TRADETIMER?
   Built specifically for people who bill by the hour. No complicated features you don't need. Just simple, fast time tracking that helps you capture every billable minute.

   PRICING:
   • Free: 1 client, 10 entries/month
   • Pro ($15/month): Unlimited everything

   Start your free trial today!

   SUPPORT:
   Questions? Email us at support@tradetimer.com
   Privacy: https://tradetimer.com/privacy
   Terms: https://tradetimer.com/terms
   ```
   (4000 characters maximum)

#### Graphic Assets

1. **App icon:**
   - Size: 512 x 512 pixels
   - Format: PNG
   - No transparency
   - Upload from: `mobile/src/assets/icon.png` (resize if needed)

2. **Feature graphic:**
   - Size: 1024 x 500 pixels
   - Format: PNG or JPG
   - Showcases app branding
   - Required for featured placement

3. **Phone screenshots:**
   - **Minimum:** 2 screenshots
   - **Maximum:** 8 screenshots
   - **Size:** Minimum 1080 x 1920 pixels
   - **Format:** PNG or JPG
   - **Aspect ratio:** 16:9 or 9:16

   Upload screenshots showing:
   - Timer in action
   - Client list
   - Time entries
   - Reports
   - Settings

4. **7-inch tablet screenshots:** (Optional)
   - Size: Minimum 1200 x 1920 pixels
   - Same guidelines as phone

5. **10-inch tablet screenshots:** (Optional)
   - Size: Minimum 1600 x 2560 pixels
   - Same guidelines as phone

6. **Promo video:** (Optional)
   - YouTube video URL
   - Maximum 30 seconds recommended
   - Shows app features

#### Categorization

1. **App category:**
   - Primary: Business

2. **Tags:** (Up to 5)
   - time tracking
   - invoice
   - freelance
   - billable hours
   - timesheet

#### Contact Details

1. **Email:**
   ```
   support@tradetimer.com
   ```

2. **Phone:** (Optional but recommended)
   ```
   +1-XXX-XXX-XXXX
   ```

3. **Website:** (Optional)
   ```
   https://tradetimer.com
   ```

4. **External marketing:** (Optional)
   - Check if you have external marketing presence

### Step 4: Store Settings

Navigate to "Store presence" → "Store settings"

1. **App category:**
   - Business

2. **Tags:** (Select up to 5)
   - Business
   - Productivity
   - Finance
   - Tools
   - Utilities

### Step 5: App Content

Complete all required app content sections:

#### Privacy Policy

1. **Navigate to:** "App content" → "Privacy policy"
2. **Privacy policy URL:**
   ```
   https://tradetimer.com/privacy
   ```
3. Save

#### App Access

1. **Navigate to:** "App content" → "App access"
2. **Select:** "All or some functionality is restricted"
3. **Provide test credentials:**
   ```
   Instructions for accessing:
   Login with the following test account to access all features:

   Email: review@tradetimer.com
   Password: ReviewTest2024!

   The app includes pre-configured test clients and time entries.
   ```
4. Save

#### Ads

1. **Navigate to:** "App content" → "Ads"
2. **Question:** Does your app contain ads?
3. **Answer:** No
4. Save

#### Content Rating

1. **Navigate to:** "App content" → "Content rating"
2. **Click:** "Start questionnaire"
3. **Email:** support@tradetimer.com
4. **Category:** Business, Productivity, Communication, or Other

5. **Answer questionnaire:**
   - Violence: No
   - Sexual content: No
   - Profanity: No
   - Controlled substances: No
   - Hate speech: No
   - Gambling: No
   - User interactions: No (unless you add social features)

6. **Calculate rating**
7. **Result:** Should be "Everyone" or "Everyone 10+"
8. **Submit**

#### Target Audience

1. **Navigate to:** "App content" → "Target audience"
2. **Select age groups:**
   - 18 and over (primary)
   - 13-17 (if applicable)
3. **Save**

#### News Apps

1. **Navigate to:** "App content" → "News apps"
2. **Is this a news app?** No
3. **Save**

#### COVID-19 Contact Tracing and Status Apps

1. **Navigate to:** "App content" → "COVID-19"
2. **Answer:** No
3. **Save**

#### Data Safety

1. **Navigate to:** "App content" → "Data safety"
2. **Click:** "Start"

3. **Data collection:**
   - **Does your app collect user data?** Yes

4. **Data types collected:**
   - Personal info:
     - [x] Name (optional)
     - [x] Email address
   - Financial info:
     - [x] User payment info (for Pro subscriptions)
   - App activity:
     - [x] App interactions
   - App info and performance:
     - [x] Crash logs
     - [x] Diagnostics

5. **Data usage:**
   - App functionality
   - Analytics
   - Account management

6. **Data handling:**
   - [x] Data is encrypted in transit
   - [x] Data is encrypted at rest
   - [x] Users can request data deletion
   - [x] Data is not shared with third parties

7. **Save and submit**

### Step 6: Create Release

#### Internal Testing (Optional but Recommended)

1. **Navigate to:** "Release" → "Testing" → "Internal testing"
2. **Create new release:**
   - Release name: 1.0.0 (Internal)
   - Release notes: "Initial internal testing build"

3. **Upload app bundle:**

   First, build with EAS:
   ```bash
   cd mobile
   eas build --platform android --profile production
   ```

   Download the AAB file when build completes.

4. **Upload AAB:**
   - Drag and drop AAB file
   - Wait for processing

5. **Add testers:**
   - Create email list of internal testers
   - Add your email for testing

6. **Review and rollout:**
   - Review all information
   - Click "Review release"
   - Click "Start rollout to Internal testing"

7. **Test thoroughly:**
   - Install on multiple devices
   - Test all features
   - Fix any issues
   - Update build if needed

#### Production Release

Once internal testing is complete:

1. **Navigate to:** "Release" → "Production"
2. **Create new release:**
   - Release name: 1.0.0

3. **Release notes:**
   ```
   Welcome to TradeTimer!

   Track your billable hours with ease:
   • One-tap time tracking
   • Client management
   • Professional reports
   • Invoice generation
   • Biometric security
   • Offline support

   Perfect for freelancers, consultants, and contractors.

   Start tracking your time today!
   ```

4. **Upload app bundle:**
   - Upload the same AAB from internal testing (if successful)
   - Or build new version if you made changes

5. **Countries/Regions:**
   - Select all countries or specific regions
   - Consider local laws and regulations

6. **Review release:**
   - Review all information
   - Check compliance with policies

7. **Start rollout:**
   - Click "Review release"
   - Click "Start rollout to Production"

### Step 7: Review Process

**Timeline:**
- **First release:** 2-7 days (can be longer)
- **Updates:** Usually 1-3 days

**Status Updates:**
- **Pending publication:** Under review
- **Approved:** Live on Play Store
- **Rejected:** See rejection reasons

**If Rejected:**
1. Read policy violation details
2. Fix issues in your app
3. Upload new build
4. Resubmit for review
5. May need to appeal if you believe rejection was in error

### Step 8: Publishing

Once approved:
- App goes live automatically on Play Store
- Users can discover and install
- Monitor reviews and crashes
- Respond to user feedback

---

## EAS Build Configuration

### Create eas.json

Create `mobile/eas.json` with build profiles:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "ios": {
        "simulator": false
      },
      "android": {
        "buildType": "aab"
      },
      "env": {
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-specific-id",
        "appleTeamId": "your-team-id"
      },
      "android": {
        "serviceAccountKeyPath": "./path/to/api-key.json",
        "track": "internal"
      }
    }
  }
}
```

### Build Commands

#### iOS Production Build
```bash
cd mobile
eas build --platform ios --profile production
```

**What happens:**
1. EAS uploads your code to their servers
2. Builds app on macOS cloud machines
3. Signs with your Apple Developer credentials
4. Outputs IPA file
5. Can auto-submit to TestFlight/App Store

**Options:**
- `--local`: Build on your machine (requires macOS)
- `--auto-submit`: Automatically submit to App Store after build
- `--clear-cache`: Clear build cache if having issues

#### Android Production Build
```bash
cd mobile
eas build --platform android --profile production
```

**What happens:**
1. EAS uploads your code to their servers
2. Builds Android App Bundle (AAB)
3. Signs with your keystore
4. Outputs AAB file ready for Play Store

**Options:**
- `--local`: Build on your machine
- `--auto-submit`: Automatically submit to Play Store after build

### Managing Credentials

EAS automatically manages signing credentials:

**iOS:**
- Distribution certificate
- Provisioning profile
- Push notification keys

**Android:**
- Keystore
- Key password
- Alias

**View credentials:**
```bash
eas credentials
```

**Update credentials:**
```bash
eas credentials --platform ios
eas credentials --platform android
```

### Environment Variables in Builds

**Option 1: eas.json**
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://api.tradetimer.com",
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  }
}
```

**Option 2: EAS Secrets**
```bash
# Set secret (not visible in eas.json)
eas secret:create --name STRIPE_KEY --value pk_live_xxxxx

# List secrets
eas secret:list

# Delete secret
eas secret:delete --name STRIPE_KEY
```

### Build Notifications

EAS sends notifications when builds complete:
- Email notifications
- Expo dashboard
- Mobile app (Expo Go)

**Monitor builds:**
```bash
# List recent builds
eas build:list

# View specific build
eas build:view [build-id]
```

---

## Store Assets Requirements

### iOS App Store Assets

#### App Icon
- **Size:** 1024 x 1024 pixels
- **Format:** PNG (no transparency)
- **Color space:** RGB
- **Safe area:** Keep important elements in center 80%

#### iPhone Screenshots

**6.7" Display (iPhone 14 Pro Max, 15 Pro Max):**
- **Resolution:** 1290 x 2796 pixels
- **Devices:** Latest Pro Max models
- **Required:** Yes

**6.5" Display (iPhone 11 Pro Max, XS Max, XR):**
- **Resolution:** 1242 x 2688 pixels
- **Devices:** Older large iPhones
- **Required:** Yes (if supporting these devices)

**5.5" Display (iPhone 8 Plus):**
- **Resolution:** 1242 x 2208 pixels
- **Devices:** Older Plus models
- **Required:** Only if minimum iOS version supports

#### iPad Screenshots

**iPad Pro 12.9" (3rd gen):**
- **Resolution:** 2048 x 2732 pixels
- **Required:** If `supportsTablet: true`

**iPad Pro 11" (1st gen):**
- **Resolution:** 1668 x 2388 pixels
- **Required:** If `supportsTablet: true`

#### App Preview Videos (Optional)
- **Duration:** 15-30 seconds recommended
- **Format:** M4V, MP4, or MOV
- **Codec:** H.264 or HEVC
- **Resolution:** Match screenshot sizes
- **Frame rate:** 30 fps minimum

### Android Play Store Assets

#### App Icon
- **Size:** 512 x 512 pixels
- **Format:** PNG (32-bit with alpha)
- **Round icon:** Will be masked

#### Feature Graphic
- **Size:** 1024 x 500 pixels
- **Format:** PNG or JPG
- **Required:** Yes
- **Use:** Prominently displayed in Play Store

#### Phone Screenshots
- **Minimum size:** 1080 x 1920 pixels
- **Maximum size:** 7680 x 4320 pixels
- **Format:** PNG or JPG
- **Quantity:** 2-8 screenshots
- **Aspect ratio:** 16:9 to 9:16

#### 7" Tablet Screenshots (Optional)
- **Minimum size:** 1200 x 1920 pixels
- **Format:** PNG or JPG
- **Quantity:** 1-8 screenshots

#### 10" Tablet Screenshots (Optional)
- **Minimum size:** 1600 x 2560 pixels
- **Format:** PNG or JPG
- **Quantity:** 1-8 screenshots

#### Promo Video (Optional)
- **Platform:** YouTube
- **Duration:** 30 seconds to 2 minutes
- **Link:** Provide YouTube URL

### Screenshot Creation Tips

1. **Use Actual Devices or Emulators:**
   ```bash
   # iOS Simulator
   xcrun simctl list devices

   # Open specific device
   open -a Simulator --args -CurrentDeviceUDID [UDID]

   # Take screenshot: Cmd + S
   ```

2. **Use Screenshot Tools:**
   - **Fastlane Snapshot:** Automate screenshot generation
   - **Shotbot:** Professional screenshot framing
   - **App Store Screenshot Generator:** Online tools

3. **Design Guidelines:**
   - Show actual app content (not templates)
   - Use real data examples
   - Highlight key features
   - Maintain consistent style
   - Add localized captions
   - Test on different screen sizes

4. **What to Screenshot:**
   - Timer running
   - Client list
   - Time entries list
   - Reports screen
   - Settings/profile
   - Login screen (optional)

---

## Testing Before Submission

### Pre-Submission Testing Checklist

#### Functionality Testing
- [ ] App launches successfully
- [ ] All screens load correctly
- [ ] Navigation works properly
- [ ] Timer starts, pauses, resumes, stops
- [ ] Client CRUD operations work
- [ ] Time entry creation works
- [ ] Reports display correctly
- [ ] Settings can be modified
- [ ] Logout and re-login work

#### Authentication Testing
- [ ] Email/password login works
- [ ] Biometric authentication works
- [ ] Password reset flow works
- [ ] Session persistence works
- [ ] Logout clears session

#### Data Testing
- [ ] Data saves correctly
- [ ] Data syncs with backend
- [ ] Offline mode works
- [ ] Data persistence after app restart
- [ ] Export functions work

#### Device Testing
- [ ] Test on iPhone SE (smallest screen)
- [ ] Test on iPhone 15 Pro Max (largest)
- [ ] Test on iPad (if supported)
- [ ] Test on Android phone (small)
- [ ] Test on Android tablet (large)

#### Performance Testing
- [ ] App launches in < 3 seconds
- [ ] Screens load quickly
- [ ] No memory leaks
- [ ] No excessive battery drain
- [ ] Smooth scrolling and animations

#### Network Testing
- [ ] Works on WiFi
- [ ] Works on cellular
- [ ] Handles slow connections
- [ ] Handles no connection (offline mode)
- [ ] Reconnection works properly

#### Edge Cases
- [ ] Empty states display correctly
- [ ] Error messages are clear
- [ ] Form validation works
- [ ] Long text displays properly
- [ ] Large datasets handled well

### TestFlight (iOS)

**Internal Testing:**
1. Build and upload to TestFlight
2. Add internal testers (up to 100)
3. No review required
4. Get immediate feedback

**External Testing:**
1. Add external testers (up to 10,000)
2. Requires App Store review (2-48 hours)
3. Public link distribution available

**Commands:**
```bash
# Build and auto-submit to TestFlight
eas build --platform ios --profile production --auto-submit

# Or manually submit after build
eas submit --platform ios
```

### Internal Testing Track (Android)

1. Create internal testing release
2. Add up to 100 testers
3. Instant distribution (no review)
4. Test thoroughly before production

**Access Internal Testing:**
- Testers receive email with link
- Install from Play Store
- Provide feedback

---

## Post-Submission

### Monitoring

#### App Store Connect Analytics
- **Impressions:** How many users saw your app
- **Downloads:** Installation count
- **Conversion rate:** Downloads / Impressions
- **Crashes:** Monitor crash reports
- **Reviews:** User ratings and reviews

#### Google Play Console Analytics
- **Store performance:** Visitors, installers
- **User acquisition:** Where users found app
- **Crashes & ANRs:** Technical issues
- **Ratings & reviews:** User feedback

### Responding to Reviews

**Best Practices:**
1. **Respond to negative reviews:**
   - Acknowledge the issue
   - Apologize if appropriate
   - Offer solution or workaround
   - Indicate if fix is coming

2. **Thank positive reviews:**
   - Brief thank you
   - Mention new features coming
   - Build relationship

3. **Response time:**
   - Within 24-48 hours
   - Shows active development
   - Improves store ranking

**Example Responses:**

**Negative review (crash):**
```
Thank you for the feedback. We're sorry you experienced a crash.
We've identified the issue and a fix is in version 1.0.1,
currently under review. Please update when available!
```

**Feature request:**
```
Great suggestion! Invoice customization is on our roadmap for Q1 2025.
Stay tuned for updates!
```

**Positive review:**
```
Thank you for the kind words! We're glad TradeTimer is helping you
track your time more effectively. More features coming soon!
```

### OTA Updates with Expo

**Over-the-Air updates** allow you to push JavaScript/asset updates without app store review:

```bash
# Publish OTA update
eas update --branch production --message "Fixed timer bug"
```

**When to use OTA:**
- Bug fixes (JS/React Native code)
- UI tweaks
- Content updates
- Minor feature updates

**When NOT to use OTA:**
- Native code changes
- New permissions
- Major feature changes
- Requires full app store submission

### Version Management

**Semantic Versioning:**
- **Major (1.x.x):** Breaking changes, major features
- **Minor (x.1.x):** New features, backwards compatible
- **Patch (x.x.1):** Bug fixes

**iOS Version Numbers:**
```json
{
  "version": "1.1.0",
  "ios": {
    "buildNumber": "5"
  }
}
```
- Increment `version` for user-visible changes
- Increment `buildNumber` for every build

**Android Version Numbers:**
```json
{
  "version": "1.1.0",
  "android": {
    "versionCode": 5
  }
}
```
- Increment `version` for user-visible changes
- Increment `versionCode` for every build (must be sequential)

### App Updates

**When to release updates:**
- Critical bug fixes (ASAP)
- Security issues (ASAP)
- Feature updates (monthly/quarterly)
- OS compatibility (as needed)

**Update process:**
1. Fix bugs or add features
2. Test thoroughly
3. Increment version numbers
4. Update release notes
5. Build new version
6. Submit to stores
7. Monitor rollout

**Release notes template:**
```
Version 1.1.0

What's New:
• Invoice PDF customization
• Dark mode support
• Performance improvements

Bug Fixes:
• Fixed timer pause issue
• Improved offline sync
• Various UI fixes

We're constantly improving TradeTimer. Got feedback?
Email us at support@tradetimer.com
```

### Analytics Setup

**Recommended Analytics:**

1. **PostHog (Product Analytics):**
   - User behavior tracking
   - Feature usage
   - Conversion funnels
   - A/B testing

2. **Sentry (Error Tracking):**
   - Crash reporting
   - Error monitoring
   - Performance monitoring
   - Release tracking

3. **Firebase Analytics (Optional):**
   - User engagement
   - Demographics
   - Retention metrics

**Implementation:**
Already configured in `mobile/src/utils/analytics.ts`

### Marketing Launch Checklist

- [ ] Press release written
- [ ] Social media posts scheduled
- [ ] Email newsletter sent
- [ ] Landing page updated
- [ ] App Store Optimization (ASO) keywords
- [ ] Product Hunt launch
- [ ] Blog post published
- [ ] Demo video created
- [ ] Influencer outreach
- [ ] Paid advertising campaigns

---

## Common Issues & Solutions

### iOS Submission Issues

#### Issue: Build Processing Takes Forever
**Solution:**
- Wait 10-15 minutes (normal processing time)
- Check Xcode Organizer for errors
- Ensure valid provisioning profile
- Verify bundle identifier matches

#### Issue: Invalid Binary
**Cause:** Missing required architectures or invalid signing
**Solution:**
```bash
# Rebuild with clean cache
eas build --platform ios --profile production --clear-cache
```

#### Issue: Missing Export Compliance
**Solution:**
Add to app.json:
```json
{
  "ios": {
    "config": {
      "usesNonExemptEncryption": false
    }
  }
}
```

#### Issue: Missing Privacy Descriptions
**Cause:** Using device features without permission descriptions
**Solution:**
Update `infoPlist` in app.json with all required descriptions.

#### Issue: App Store Rejection - Guideline 2.1 (Performance)
**Cause:** App crashes, has bugs, or incomplete features
**Solution:**
- Fix all crashes
- Test on physical devices
- Complete all features
- Provide demo account with full access

#### Issue: App Store Rejection - Guideline 4.0 (Design)
**Cause:** Poor UX, incomplete design, or placeholder content
**Solution:**
- Polish UI/UX
- Remove placeholder content
- Ensure consistent design
- Test on all screen sizes

### Android Submission Issues

#### Issue: Upload Failed
**Cause:** Version code not incremented
**Solution:**
```json
{
  "android": {
    "versionCode": 2  // Increment from previous version
  }
}
```

#### Issue: Privacy Policy Missing
**Solution:**
- Publish privacy policy to accessible URL
- Add URL in Play Console
- Ensure it addresses all collected data

#### Issue: Data Safety Form Incomplete
**Solution:**
- Complete all sections in Data Safety
- Declare all data collection accurately
- Specify encryption and sharing practices

#### Issue: Content Rating Incomplete
**Solution:**
- Complete content rating questionnaire
- Answer all questions honestly
- Re-calculate rating if changes made

#### Issue: Missing Permissions Declaration
**Cause:** Using permissions not declared in manifest
**Solution:**
Update app.json:
```json
{
  "android": {
    "permissions": [
      "USE_BIOMETRIC",
      "USE_FINGERPRINT",
      "VIBRATE"
    ]
  }
}
```

### Build Issues

#### Issue: EAS Build Fails
**Check build logs:**
```bash
eas build:list
eas build:view [build-id]
```

**Common causes:**
- Dependency issues: Run `npm install`
- TypeScript errors: Run `npx tsc --noEmit`
- Environment variables missing
- Cache issues: Use `--clear-cache`

#### Issue: Credentials Error
**Solution:**
```bash
# Reset credentials
eas credentials --platform ios
eas credentials --platform android

# Or delete and recreate
eas credentials:delete --platform ios
eas build --platform ios --profile production
```

#### Issue: Out of Memory During Build
**Solution:**
- Reduce bundle size
- Remove unused dependencies
- Optimize images
- Use `--clear-cache`

### Runtime Issues

#### Issue: White Screen on Launch
**Causes:**
- JavaScript bundle not loaded
- Crash during initialization
- Missing splash screen

**Solution:**
- Check error logs with Sentry
- Test in development mode
- Verify all imports

#### Issue: Biometric Authentication Not Working
**Causes:**
- Device doesn't support biometrics
- Permissions not granted
- Simulator limitations

**Solution:**
- Test on physical device
- Check permission descriptions
- Implement fallback to password

#### Issue: Offline Mode Not Working
**Causes:**
- AsyncStorage not configured
- Sync logic issues

**Solution:**
- Check AsyncStorage implementation
- Test airplane mode thoroughly
- Verify sync after reconnection

---

## Additional Resources

### Apple Resources
- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/
- **App Store Connect Help:** https://help.apple.com/app-store-connect/
- **TestFlight:** https://developer.apple.com/testflight/

### Google Resources
- **Play Console Help:** https://support.google.com/googleplay/android-developer/
- **Play Store Guidelines:** https://play.google.com/about/developer-content-policy/
- **Material Design:** https://material.io/design
- **Android App Bundles:** https://developer.android.com/guide/app-bundle

### Expo Resources
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **App Store Deployment:** https://docs.expo.dev/distribution/app-stores/
- **Expo Forums:** https://forums.expo.dev/

### Tools
- **App Store Screenshot Generator:** https://www.appstorescreenshot.com/
- **Google Play Screenshot Generator:** https://www.applaunchpad.com/
- **ASO Tools:** App Annie, Sensor Tower, AppTweak
- **Icon Generators:** https://www.appicon.co/

---

## Support

For questions or issues with deployment:

- **Email:** support@tradetimer.com
- **Documentation:** https://tradetimer.com/docs
- **GitHub Issues:** https://github.com/tradetimer/mobile/issues

---

**Last Updated:** November 2025
**Document Version:** 1.0.0
