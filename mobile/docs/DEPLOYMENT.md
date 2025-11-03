# TradeTimer Mobile - Deployment Guide

Complete guide for deploying TradeTimer mobile app to iOS App Store and Google Play Store.

## Prerequisites

- Expo account (https://expo.dev)
- Apple Developer Account ($99/year) for iOS
- Google Play Developer Account ($25 one-time) for Android
- EAS CLI installed: `npm install -g eas-cli`

## Initial Setup

### 1. Login to Expo

```bash
eas login
```

### 2. Initialize EAS

```bash
cd mobile
eas init
```

This creates an Expo project and links it to your account.

### 3. Configure Build

```bash
eas build:configure
```

This creates `eas.json`:

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
        "bundler": "metro"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## iOS Deployment

### Step 1: Prepare Assets

1. **App Icon** (1024x1024 PNG)
   - Place in `src/assets/icon.png`
   - No alpha channel
   - Square dimensions

2. **Splash Screen** (1242x2688 PNG)
   - Place in `src/assets/splash.png`
   - Background color: `#0369a1`

3. **Adaptive Icon** (Android, 1024x1024 PNG)
   - Place in `src/assets/adaptive-icon.png`

### Step 2: Update app.json

```json
{
  "expo": {
    "name": "TradeTimer",
    "slug": "tradetimer",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.tradetimer.app",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID for quick and secure login"
      }
    }
  }
}
```

### Step 3: Build for iOS

```bash
eas build --platform ios
```

This will:
1. Upload your code to Expo servers
2. Build the app on their servers
3. Return a download URL

**Build will take 10-20 minutes.**

### Step 4: Download and Test

Download the `.ipa` file and test with TestFlight:

1. Go to App Store Connect
2. Create new app
3. Upload build via Transporter or `eas submit`
4. Add to TestFlight
5. Invite testers

### Step 5: Submit to App Store

```bash
eas submit --platform ios
```

Or manually:
1. Fill in app information in App Store Connect
2. Add screenshots (required sizes)
3. Set pricing (free)
4. Submit for review

**Review takes 1-3 days.**

## Android Deployment

### Step 1: Build for Android

```bash
eas build --platform android
```

This creates an `.aab` file (Android App Bundle).

### Step 2: Create Google Play Account

1. Go to https://play.google.com/console
2. Create developer account ($25 one-time fee)
3. Create new app

### Step 3: Prepare Store Listing

Required assets:
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (at least 2)
  - Phone: 16:9 or 9:16 ratio
  - Tablet: 16:9 or 9:16 ratio (optional)

### Step 4: Submit to Google Play

```bash
eas submit --platform android
```

Or manually:
1. Upload `.aab` file to Google Play Console
2. Fill in store listing
3. Set content rating
4. Submit for review

**Review takes 1-7 days.**

## Environment Configuration

### Production Environment Variables

Create `eas.json` with secrets:

```bash
eas secret:create --scope project --name SUPABASE_URL --value your_url
eas secret:create --scope project --name SUPABASE_ANON_KEY --value your_key
eas secret:create --scope project --name STRIPE_KEY --value your_key
```

Or use `.env.production`:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EXPO_PUBLIC_APP_ENV=production
```

## Version Management

### Incrementing Versions

**iOS:**
```json
{
  "ios": {
    "buildNumber": "2"  // Increment for each build
  }
}
```

**Android:**
```json
{
  "android": {
    "versionCode": 2  // Increment for each build
  }
}
```

**App Version:**
```json
{
  "version": "1.0.1"  // Semantic versioning
}
```

## Over-the-Air (OTA) Updates

For minor updates that don't require app store review:

### 1. Configure Updates

```bash
eas update:configure
```

### 2. Publish Update

```bash
eas update --branch production --message "Fix timer bug"
```

### 3. Update Rollout

- Automatic: Users get update on next app launch
- Immediate: Force update with code

**Limitations:**
- Can't update native code
- Can't change app.json significantly
- Best for JS-only changes

## Build Profiles

### Development Build

```bash
eas build --profile development --platform ios
```

Use for:
- Testing native code changes
- Debugging on device

### Preview Build

```bash
eas build --profile preview --platform android
```

Use for:
- Internal testing
- Client demos
- QA testing

### Production Build

```bash
eas build --profile production --platform all
```

Use for:
- App Store / Play Store submissions

## Continuous Deployment

### GitHub Actions (Example)

Create `.github/workflows/eas-build.yml`:

```yaml
name: EAS Build

on:
  push:
    branches:
      - main

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Install dependencies
        run: cd mobile && npm install

      - name: Build iOS
        run: cd mobile && eas build --platform ios --non-interactive --no-wait

      - name: Build Android
        run: cd mobile && eas build --platform android --non-interactive --no-wait
```

## Monitoring

### Sentry Integration

1. Create Sentry project
2. Add DSN to `.env`
3. Errors automatically reported

### PostHog Analytics

1. Create PostHog project
2. Add API key to `.env`
3. Track user events

## Pre-Submission Checklist

### iOS

- [ ] App icon (1024x1024, no alpha)
- [ ] Splash screen
- [ ] Bundle identifier set
- [ ] Version and build number updated
- [ ] TestFlight tested
- [ ] Screenshots prepared (all required sizes)
- [ ] App Store description written
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Keywords for search
- [ ] Age rating completed

### Android

- [ ] App icon (512x512)
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (at least 2)
- [ ] Package name set
- [ ] Version code incremented
- [ ] Play Store description
- [ ] Privacy policy URL
- [ ] Content rating questionnaire
- [ ] Target API level (33+)

## Post-Deployment

### 1. Monitor Crashes

Check Sentry dashboard for errors

### 2. User Feedback

Monitor:
- App Store reviews
- Play Store reviews
- Support emails

### 3. Analytics

Track:
- Daily active users
- Session duration
- Feature usage
- Conversion rates

### 4. Plan Updates

Schedule:
- Bug fixes (as needed)
- Minor updates (monthly)
- Major features (quarterly)

## Rollback Strategy

If critical bug discovered:

1. **Quick fix:**
   ```bash
   # Fix bug
   eas update --branch production --message "Hotfix: Critical bug"
   ```

2. **Full rollback:**
   - Revert to previous version
   - Build and submit emergency update
   - Communicate with users

## Cost Breakdown

### One-Time

- Google Play: $25
- Apple Developer: $99/year

### Ongoing

- Expo EAS (optional): Free tier available
- Supabase: Free tier → $25/month (Pro)
- Sentry: Free tier → $26/month
- Domain: ~$12/year

## Support Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Play Store Policies](https://play.google.com/about/developer-content-policy/)

## Troubleshooting

### Build Fails

Check:
- `eas.json` configuration
- `app.json` validity
- Expo SDK compatibility
- Native dependencies

### Submission Rejected

Common reasons:
- Missing privacy policy
- Incomplete metadata
- Crashy app
- Guideline violations

### OTA Update Not Working

- Check update configuration
- Verify branch name
- Clear app cache
- Reinstall app

## Conclusion

Deployment is now automated with EAS! The process:

1. Make changes
2. Test thoroughly
3. Update version numbers
4. Build with `eas build`
5. Submit with `eas submit`
6. Monitor and iterate

For questions: support@tradetimer.com
