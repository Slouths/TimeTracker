# TradeTimer Mobile - Setup Guide

Complete setup instructions for the TradeTimer mobile application.

## Prerequisites

### Required Software

1. **Node.js and npm**
   - Version: 18.0.0 or higher
   - Download: https://nodejs.org/

2. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

3. **EAS CLI** (for building)
   ```bash
   npm install -g eas-cli
   ```

4. **Development Environment**
   - **For iOS:** macOS with Xcode 14+
   - **For Android:** Android Studio with Android SDK

### Expo Go App (For Development)

Install Expo Go on your physical device:
- iOS: https://apps.apple.com/app/expo-go/id982107779
- Android: https://play.google.com/store/apps/details?id=host.exp.exponent

## Step-by-Step Setup

### 1. Clone and Navigate

```bash
cd /path/to/TimeTracker/mobile
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native and Expo
- Navigation libraries
- Supabase client
- State management (Zustand)
- UI components
- And more...

### 3. Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
# Supabase (Required)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe (Required for payments)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PostHog Analytics (Optional)
EXPO_PUBLIC_POSTHOG_KEY=phc_...
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# Sentry Error Tracking (Optional)
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# App Environment
EXPO_PUBLIC_APP_ENV=development
```

### 4. Start Development Server

```bash
npm start
```

You should see a QR code in the terminal. Scan it with:
- iOS: Camera app
- Android: Expo Go app

## Platform-Specific Setup

### iOS Setup

1. **Install Xcode** (macOS only)
   - Download from Mac App Store
   - Install Command Line Tools:
     ```bash
     xcode-select --install
     ```

2. **Install CocoaPods**
   ```bash
   sudo gem install cocoapods
   ```

3. **Run iOS Simulator**
   ```bash
   npm run ios
   ```

### Android Setup

1. **Install Android Studio**
   - Download from https://developer.android.com/studio

2. **Set up Android SDK**
   - Open Android Studio
   - Go to Preferences → Appearance & Behavior → System Settings → Android SDK
   - Install Android 11+ SDK

3. **Set Environment Variables** (add to ~/.zshrc or ~/.bash_profile)
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

4. **Run Android Emulator**
   ```bash
   npm run android
   ```

## Database Setup

### Supabase Configuration

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Note your project URL and anon key

2. **Run Migrations**
   - In your Supabase dashboard, go to SQL Editor
   - Run the migrations from `../supabase/migrations/` folder
   - This creates all necessary tables

3. **Enable RLS (Row Level Security)**
   - Ensure RLS is enabled on all tables
   - Policies should allow users to access only their own data

## Biometric Authentication Setup

### iOS (Face ID / Touch ID)

Already configured in `app.json`:
```json
{
  "ios": {
    "infoPlist": {
      "NSFaceIDUsageDescription": "Use Face ID for quick and secure login"
    }
  }
}
```

### Android (Fingerprint / Face Unlock)

Already configured in `app.json`:
```json
{
  "android": {
    "permissions": [
      "USE_BIOMETRIC",
      "USE_FINGERPRINT"
    ]
  }
}
```

## EAS Build Setup (For Production Builds)

1. **Login to Expo**
   ```bash
   eas login
   ```

2. **Initialize EAS**
   ```bash
   eas init
   ```

3. **Configure Build**
   ```bash
   eas build:configure
   ```

   This creates `eas.json`:
   ```json
   {
     "build": {
       "development": {
         "developmentClient": true,
         "distribution": "internal"
       },
       "preview": {
         "distribution": "internal"
       },
       "production": {}
     }
   }
   ```

## Testing the Setup

### Quick Test Checklist

1. **Start the app**
   ```bash
   npm start
   ```

2. **Test Authentication**
   - Sign up with a test account
   - Sign in with the account
   - Test biometric auth (on physical device)

3. **Test Timer**
   - Add a test client
   - Start the timer
   - Pause/resume
   - Stop and save entry

4. **Test Offline Mode**
   - Enable airplane mode
   - App should still work
   - Disable airplane mode
   - Data should sync

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 19000
npx kill-port 19000
npm start
```

### Metro Bundler Cache Issues

```bash
npm start -- --reset-cache
```

### iOS Pod Install Fails

```bash
cd ios
pod install --repo-update
cd ..
```

### Android Gradle Build Fails

```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Environment Variables Not Loading

- Ensure `.env` file is in the `mobile/` directory
- Restart Metro bundler after changing `.env`
- Use `EXPO_PUBLIC_` prefix for all variables

## Next Steps

After setup is complete:

1. Read `ARCHITECTURE.md` to understand the codebase
2. Read `DEPLOYMENT.md` for deployment instructions
3. Explore the source code in `src/`
4. Make your first changes and test

## Support

If you encounter issues:

1. Check this documentation
2. Search existing GitHub issues
3. Create a new issue with details:
   - Error message
   - Steps to reproduce
   - Environment (OS, Node version, etc.)

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Supabase Docs](https://supabase.com/docs)
- [Zustand Guide](https://github.com/pmndrs/zustand)
