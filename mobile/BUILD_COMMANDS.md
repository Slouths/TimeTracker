# Build Commands Reference

Complete reference for building and submitting TradeTimer to App Store and Google Play Store using Expo EAS.

---

## Prerequisites

### Install Required Tools

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Install Expo CLI (optional, for development)
npm install -g expo-cli

# Verify installations
eas --version
expo --version
```

### Login to Expo

```bash
# Login with existing account
eas login

# Or create new account
eas register

# Verify login
eas whoami
```

### Initialize EAS in Project

```bash
# Navigate to mobile directory
cd mobile

# Initialize EAS (creates eas.json and links project)
eas init

# Follow prompts to create or link project
# This will add projectId to app.json
```

---

## Build Profiles

The `eas.json` file defines three build profiles:

### Development Profile
- Used for local development and testing
- Includes development client
- iOS builds can run on simulator
- Faster build times

### Preview Profile
- Used for internal testing
- iOS builds for physical devices (TestFlight ready)
- Android builds as APK (easy distribution)
- Can test before production

### Production Profile
- Used for app store submission
- iOS builds as IPA for App Store
- Android builds as AAB for Play Store
- Includes production environment variables

---

## iOS Builds

### Development Build (iOS Simulator)
```bash
eas build --platform ios --profile development
```

**Use case:** Local development and testing on simulator
**Output:** iOS Simulator build
**Distribution:** Internal only
**Time:** ~10-15 minutes

### Preview Build (TestFlight)
```bash
eas build --platform ios --profile preview
```

**Use case:** Beta testing with TestFlight
**Output:** IPA file for physical devices
**Distribution:** Internal testing
**Time:** ~15-20 minutes

**Then submit to TestFlight:**
```bash
eas submit --platform ios --latest
```

### Production Build (App Store)
```bash
eas build --platform ios --profile production
```

**Use case:** App Store submission
**Output:** IPA file optimized for App Store
**Distribution:** Public via App Store
**Time:** ~15-20 minutes

**Options:**
- `--auto-submit`: Automatically submit to App Store after build
- `--clear-cache`: Clear build cache if having issues
- `--local`: Build locally on your Mac (requires Xcode)

**With auto-submit:**
```bash
eas build --platform ios --profile production --auto-submit
```

### Submit iOS Build Manually
```bash
# Submit the latest build
eas submit --platform ios --latest

# Or submit specific build
eas submit --platform ios --id [build-id]
```

---

## Android Builds

### Development Build (APK)
```bash
eas build --platform android --profile development
```

**Use case:** Local development and testing
**Output:** APK file
**Distribution:** Internal only
**Time:** ~10-15 minutes

### Preview Build (APK for Testing)
```bash
eas build --platform android --profile preview
```

**Use case:** Beta testing, easy distribution
**Output:** APK file that can be installed directly
**Distribution:** Internal testing (can share APK file)
**Time:** ~10-15 minutes

### Production Build (AAB for Play Store)
```bash
eas build --platform android --profile production
```

**Use case:** Play Store submission
**Output:** AAB (Android App Bundle) optimized for Play Store
**Distribution:** Public via Google Play Store
**Time:** ~15-20 minutes

**Options:**
- `--auto-submit`: Automatically submit to Play Store after build
- `--clear-cache`: Clear build cache if having issues
- `--local`: Build locally (requires Android SDK)

**With auto-submit:**
```bash
eas build --platform android --profile production --auto-submit
```

### Submit Android Build Manually
```bash
# Submit the latest build
eas submit --platform android --latest

# Or submit specific build
eas submit --platform android --id [build-id]
```

---

## Build Both Platforms

### Build iOS and Android Together
```bash
# Production builds for both platforms
eas build --platform all --profile production

# Preview builds for both platforms
eas build --platform all --profile preview

# Development builds for both platforms
eas build --platform all --profile development
```

**Note:** Builds run in parallel, so total time is similar to single platform.

---

## Monitoring Builds

### List Recent Builds
```bash
# List all builds
eas build:list

# List builds for specific platform
eas build:list --platform ios
eas build:list --platform android

# List builds for specific profile
eas build:list --profile production
```

### View Build Details
```bash
# View specific build
eas build:view [build-id]

# View latest build
eas build:view --latest
```

### Build Status
Builds will show one of these statuses:
- `in-queue`: Waiting to start
- `in-progress`: Currently building
- `finished`: Build completed successfully
- `errored`: Build failed
- `canceled`: Build was canceled

### Monitor Build Progress
```bash
# View live build logs
eas build:view [build-id]

# Or monitor via dashboard
# Visit: https://expo.dev/accounts/[username]/projects/[project]/builds
```

---

## Managing Credentials

EAS automatically manages signing credentials for you.

### View Credentials
```bash
# View all credentials
eas credentials

# View iOS credentials
eas credentials --platform ios

# View Android credentials
eas credentials --platform android
```

### iOS Credentials Managed
- Distribution certificate
- Provisioning profile
- Push notification keys (if configured)

### Android Credentials Managed
- Keystore file
- Keystore password
- Key alias
- Key password

### Update or Reset Credentials
```bash
# Configure iOS credentials
eas credentials --platform ios

# Configure Android credentials
eas credentials --platform android

# Delete and regenerate credentials (use with caution)
eas credentials:delete --platform ios
eas credentials:delete --platform android
```

---

## Environment Variables

### Option 1: Set in eas.json
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

**Pros:** Version controlled, easy to update
**Cons:** Values visible in repository

### Option 2: Use EAS Secrets
```bash
# Create a secret
eas secret:create --name STRIPE_KEY --value pk_live_xxxxx

# Create with scope (for specific environment)
eas secret:create --name API_KEY --value xxx --scope project

# List all secrets
eas secret:list

# Delete a secret
eas secret:delete --name STRIPE_KEY
```

**Pros:** Secure, not visible in code
**Cons:** Can't see values easily, must manage separately

### Option 3: .env Files
```bash
# Create .env.production file (DO NOT commit to git)
EXPO_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key
EXPO_PUBLIC_STRIPE_KEY=pk_live_xxx
```

Then load in eas.json:
```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_SUPABASE_URL": "${EXPO_PUBLIC_SUPABASE_URL}",
        "EXPO_PUBLIC_SUPABASE_ANON_KEY": "${EXPO_PUBLIC_SUPABASE_ANON_KEY}"
      }
    }
  }
}
```

---

## Build Notifications

### Email Notifications
EAS sends email when:
- Build starts
- Build completes successfully
- Build fails

### Slack Integration (Optional)
```bash
# Set up Slack webhooks in EAS dashboard
# Visit: https://expo.dev/accounts/[username]/settings/webhooks
```

### Check Build Status via CLI
```bash
# Quick status check
eas build:list --limit 5

# Or check specific build
eas build:view [build-id]
```

---

## Local Builds

If you need to build locally instead of on EAS servers:

### Local iOS Build (requires macOS)
```bash
# Must have Xcode installed
eas build --platform ios --profile production --local
```

**Requirements:**
- macOS computer
- Xcode 15.0 or later
- Valid Apple Developer account
- Provisioning profiles configured

### Local Android Build
```bash
# Can build on any OS
eas build --platform android --profile production --local
```

**Requirements:**
- Android SDK installed
- Java Development Kit (JDK)
- Android build tools

**Note:** Local builds are slower but give you more control.

---

## Troubleshooting

### Build Failed - Clear Cache
```bash
# Clear build cache and retry
eas build --platform ios --clear-cache --profile production
eas build --platform android --clear-cache --profile production
```

### Build Failed - Check Logs
```bash
# View detailed build logs
eas build:view [build-id]

# Look for:
# - Dependency errors
# - TypeScript errors
# - Native module issues
# - Credential problems
```

### Common Build Errors

#### "Duplicate module name"
**Solution:** Clear cache and node_modules
```bash
rm -rf node_modules
npm install
eas build --clear-cache --platform ios
```

#### "No valid code signing certificates found"
**Solution:** Reset iOS credentials
```bash
eas credentials --platform ios
# Select "Remove all credentials" and rebuild
```

#### "Android build failed with exit code 1"
**Solution:** Check for:
- Gradle version compatibility
- Android SDK version issues
- Memory issues (increase heap size in gradle.properties)

#### "Expo Config Error"
**Solution:** Validate app.json
```bash
# Check for syntax errors in app.json
npx expo config --type public
```

### Build Takes Too Long
- Typical build time: 10-20 minutes
- If stuck "in queue": Check EAS service status
- If stuck "in progress" > 30 minutes: Cancel and retry

```bash
# Cancel a build
eas build:cancel [build-id]
```

### Out of Build Minutes
- Free tier: 30 builds/month
- If exceeded: Upgrade to paid plan or wait for next month
- Check usage: https://expo.dev/accounts/[username]/settings/billing

---

## Updating App Versions

Before building a new version:

### Update Version Numbers

**In app.json:**
```json
{
  "expo": {
    "version": "1.1.0",  // Increment version
    "ios": {
      "buildNumber": "2"  // Increment build number
    },
    "android": {
      "versionCode": 2    // Increment version code
    }
  }
}
```

**Semantic Versioning:**
- **Major (1.x.x):** Breaking changes
- **Minor (x.1.x):** New features
- **Patch (x.x.1):** Bug fixes

**iOS Build Number:**
- Must increment for each build
- Can be same as version or separate
- App Store requires unique build numbers

**Android Version Code:**
- Must increment for each build
- Must be an integer
- Play Store requires sequential version codes

### Build Updated Version
```bash
# After updating version numbers
eas build --platform all --profile production
```

---

## OTA Updates (Over-the-Air)

For JavaScript-only changes, you can use OTA updates without rebuilding:

```bash
# Publish OTA update
eas update --branch production --message "Fixed timer bug"

# Publish to specific channel
eas update --channel production --message "UI improvements"

# Configure auto-updates in app.json
{
  "expo": {
    "updates": {
      "url": "https://u.expo.dev/[project-id]"
    },
    "runtimeVersion": {
      "policy": "sdkVersion"
    }
  }
}
```

**When to use OTA:**
- Bug fixes (JS/React Native code)
- UI tweaks
- Content updates
- No native code changes

**When NOT to use OTA:**
- Native code changes
- New permissions
- app.json changes (most fields)
- Requires new build and store submission

---

## Submission Commands

### Submit to Apple App Store
```bash
# Submit latest iOS build
eas submit --platform ios --latest

# Or specify build ID
eas submit --platform ios --id [build-id]

# With custom App Store Connect credentials
eas submit --platform ios --apple-id your@email.com
```

**What happens:**
1. Build is uploaded to App Store Connect
2. Appears in TestFlight automatically
3. Can be added to App Store version
4. Requires: Apple Developer account, App created in App Store Connect

### Submit to Google Play Store
```bash
# Submit latest Android build
eas submit --platform android --latest

# Or specify build ID
eas submit --platform android --id [build-id]

# To specific track
eas submit --platform android --track internal
eas submit --platform android --track production
```

**What happens:**
1. AAB uploaded to Play Console
2. Submitted to specified track (internal/production)
3. Begins review process
4. Requires: Google Play Developer account, service account key

### Configure Submission in eas.json

**For iOS:**
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCDEFGHIJ"
      }
    }
  }
}
```

**For Android:**
```json
{
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

---

## Quick Reference

### Essential Commands

```bash
# Login
eas login

# Initialize project
cd mobile && eas init

# Build for iOS production
eas build --platform ios --profile production

# Build for Android production
eas build --platform android --profile production

# Build both platforms
eas build --platform all --profile production

# Submit to App Store
eas submit --platform ios --latest

# Submit to Play Store
eas submit --platform android --latest

# List builds
eas build:list

# View build details
eas build:view [build-id]

# Manage credentials
eas credentials

# Create secret
eas secret:create --name KEY_NAME --value key_value

# OTA update
eas update --branch production --message "Update description"
```

### Build Workflow

1. **Prepare:**
   - Update version numbers in app.json
   - Test app thoroughly
   - Commit all changes

2. **Build:**
   ```bash
   eas build --platform all --profile production
   ```

3. **Wait:**
   - Monitor build progress (10-20 minutes)
   - Receive email when complete

4. **Test:**
   - Download and install build on physical devices
   - Test all features
   - Verify no crashes

5. **Submit:**
   ```bash
   eas submit --platform ios --latest
   eas submit --platform android --latest
   ```

6. **Monitor:**
   - Check submission status in store consoles
   - Respond to reviewer questions
   - Wait for approval (iOS: 24-48h, Android: 2-7 days)

---

## Additional Resources

- **EAS Build Documentation:** https://docs.expo.dev/build/introduction/
- **EAS Submit Documentation:** https://docs.expo.dev/submit/introduction/
- **EAS Update Documentation:** https://docs.expo.dev/eas-update/introduction/
- **Expo CLI Reference:** https://docs.expo.dev/workflow/expo-cli/
- **Build Troubleshooting:** https://docs.expo.dev/build-reference/troubleshooting/

---

## Support

If you encounter issues:

1. **Check build logs:** `eas build:view [build-id]`
2. **Search Expo forums:** https://forums.expo.dev/
3. **Check EAS status:** https://status.expo.dev/
4. **Contact support:** support@tradetimer.com

---

**Last Updated:** November 3, 2025
