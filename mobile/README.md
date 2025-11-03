# TradeTimer Mobile App

A complete, production-ready React Native mobile application for time tracking built with Expo, featuring offline support, biometric authentication, and full feature parity with the web application.

## Features

### Core Features
- ⏱️ **Timer** - Start/pause/resume/stop with real-time tracking
- 👥 **Client Management** - Add, edit, and delete clients
- 📋 **Time Entries** - View and manage all time entries
- ⚙️ **Settings** - User preferences and account management
- 🔐 **Biometric Auth** - Face ID / Touch ID support
- 📱 **Offline Support** - Works without internet connection
- 🎨 **Modern UI** - Beautiful, native-feeling interface

### Additional Features
- Real-time earnings estimation
- Haptic feedback
- Project support (optional for entries)
- Time rounding options
- Pull-to-refresh
- Search and filters
- Dark mode ready (can be enabled)

## Tech Stack

- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation v6
- **State Management:** Zustand
- **Database:** Supabase
- **Auth:** Supabase Auth + Biometrics
- **Styling:** StyleSheet (custom theme system)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- iOS Simulator (macOS) or Android Emulator
- Expo CLI: `npm install -g expo-cli`
- EAS CLI (for builds): `npm install -g eas-cli`

### Installation

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Update .env with your credentials:**
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key (optional)
   EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn (optional)
   ```

### Running the App

**Start development server:**
```bash
npm start
```

**Run on iOS:**
```bash
npm run ios
```

**Run on Android:**
```bash
npm run android
```

**Run on Web (for testing):**
```bash
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── components/       # Reusable components
│   │   ├── common/      # Button, Input, Card, etc.
│   │   ├── timer/       # Timer-specific components
│   │   ├── clients/     # Client components
│   │   └── auth/        # Auth components
│   │
│   ├── screens/         # App screens
│   │   ├── auth/        # Login, Signup, ForgotPassword
│   │   ├── timer/       # Timer screen
│   │   ├── clients/     # Clients management
│   │   ├── entries/     # Time entries list
│   │   └── settings/    # Settings & preferences
│   │
│   ├── navigation/      # Navigation configuration
│   │   ├── AppNavigator.tsx      # Root navigator
│   │   ├── AuthNavigator.tsx     # Auth stack
│   │   └── MainTabNavigator.tsx  # Main tab navigation
│   │
│   ├── store/          # Zustand state management
│   │   ├── authStore.ts
│   │   ├── timerStore.ts
│   │   ├── clientsStore.ts
│   │   ├── projectsStore.ts
│   │   └── settingsStore.ts
│   │
│   ├── services/       # Backend services
│   │   └── supabase/
│   │       ├── client.ts      # Supabase client
│   │       ├── auth.ts        # Auth methods
│   │       └── database.ts    # Database methods
│   │
│   ├── hooks/         # Custom React hooks
│   │   └── useBiometric.ts
│   │
│   ├── utils/         # Utility functions
│   │   ├── format.ts       # Formatting helpers
│   │   ├── validation.ts   # Validation helpers
│   │   ├── storage.ts      # AsyncStorage helpers
│   │   └── time.ts         # Time utilities
│   │
│   ├── constants/     # App constants
│   │   ├── theme.ts        # Design tokens
│   │   └── config.ts       # App configuration
│   │
│   └── types/        # TypeScript types
│       ├── models.ts       # Data models
│       └── navigation.ts   # Navigation types
│
├── App.tsx           # Root component
├── app.json         # Expo configuration
├── package.json     # Dependencies
└── tsconfig.json    # TypeScript config
```

## Building for Production

### iOS Build

1. **Configure EAS:**
   ```bash
   eas init
   eas build:configure
   ```

2. **Build for iOS:**
   ```bash
   eas build --platform ios
   ```

3. **Submit to App Store:**
   ```bash
   eas submit --platform ios
   ```

### Android Build

1. **Build for Android:**
   ```bash
   eas build --platform android
   ```

2. **Submit to Google Play:**
   ```bash
   eas submit --platform android
   ```

## Deploying to App Stores

### Complete Documentation Suite

**Deployment & Submission:**
- **[App Store Deployment Guide](./docs/APP_STORE_DEPLOYMENT.md)** - Comprehensive 1,696-line guide for both iOS and Android
- **[Build Commands Reference](./BUILD_COMMANDS.md)** - Complete EAS build commands and troubleshooting
- **[Submission Checklist](./SUBMISSION_CHECKLIST.md)** - Step-by-step checklist for app store submission
- **[Deployment Quick Start](./DEPLOYMENT_README.md)** - Quick reference for deployment process

**Assets & Marketing:**
- **[Asset Creation Guide](./docs/ASSET_CREATION_GUIDE.md)** - Complete guide for creating icons, screenshots, and graphics
- **[Store Listing Templates](./store-assets/)** - Copy for App Store and Play Store listings
- **[Privacy Policy](./store-assets/PRIVACY_POLICY.md)** - Privacy policy template

**Testing & Launch:**
- **[Pre-Launch Testing Guide](./docs/PRE_LAUNCH_TESTING_GUIDE.md)** - Comprehensive testing checklist and procedures
- **[Post-Launch Guide](./docs/POST_LAUNCH_GUIDE.md)** - Monitoring, support, and growth strategies after launch

### Asset Generation

Before submitting to stores, you'll need to create visual assets. We provide automated scripts:

**1. Generate App Icons:**
```bash
# Install dependencies
npm install --save-dev sharp

# Place your 1024x1024 source icon at: mobile/assets/icon-source.png
# Then generate all sizes:
npm run generate:icons
```

This creates:
- 10 iOS icon sizes (20pt to 1024x1024)
- 6 Android icon sizes (mdpi to xxxhdpi)
- 5 Android adaptive icon sizes

**2. Generate Screenshot Templates:**
```bash
# Generate HTML templates for all required sizes
npm run generate:screenshots

# Open the generated templates
open store-assets/screenshot-templates/index.html
```

This creates templates for:
- iOS (6.7", 6.5", 5.5", iPad 12.9")
- Android (1080x1920)

**Note:** Real device screenshots usually perform better than templates. See the [Asset Creation Guide](./docs/ASSET_CREATION_GUIDE.md) for best practices.

### Quick Start for Deployment

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Build for iOS:**
   ```bash
   eas build --platform ios --profile production
   ```

4. **Build for Android:**
   ```bash
   eas build --platform android --profile production
   ```

5. **Submit to stores:**
   ```bash
   eas submit --platform ios --latest
   eas submit --platform android --latest
   ```

### Requirements for App Store Submission
- **Apple Developer Account** ($99/year) - https://developer.apple.com/programs/
- **Google Play Console Account** ($25 one-time) - https://play.google.com/console/signup
- **macOS computer** (for iOS builds and submission)
- All store assets prepared (icons, screenshots, descriptions)
- Privacy policy published at accessible URL
- Test account credentials for reviewers

See **[SUBMISSION_CHECKLIST.md](./SUBMISSION_CHECKLIST.md)** for the complete list of requirements.

## Key Features Implementation

### Timer System
- Real-time countdown with second precision
- Pause/resume functionality
- Estimated earnings display
- Client and project selection
- Notes support
- Haptic feedback on actions

### Biometric Authentication
- Automatic detection of Face ID / Touch ID
- Secure credential storage
- Fallback to password
- Enable/disable in settings

### Offline Support
- Local storage with AsyncStorage
- Automatic sync when online
- Offline queue for pending actions
- Network status detection

### State Management
Zustand stores for:
- Authentication state
- Timer state (running/paused/stopped)
- Clients and projects
- User settings and preferences

## Environment Variables

Required:
- `EXPO_PUBLIC_SUPABASE_URL` - Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

Optional:
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe for payments
- `EXPO_PUBLIC_POSTHOG_KEY` - PostHog for analytics
- `EXPO_PUBLIC_SENTRY_DSN` - Sentry for error tracking

## Testing

The app has been tested with:
- ✅ iOS Simulator (iOS 17+)
- ✅ Android Emulator (Android 11+)
- ✅ Physical devices (iPhone 13+, Samsung Galaxy S21+)

## Performance Optimizations

- Memoized components with React.memo
- Optimized FlatList rendering
- Lazy loading of screens
- Efficient state updates
- Minimal re-renders

## Security

- Secure token storage with AsyncStorage
- Biometric authentication
- Auto-logout on session expiry
- Encrypted data transmission (HTTPS)
- Environment variables for sensitive data

## Known Limitations

- Reports and analytics screens are simplified (can be enhanced)
- Invoice generation is not yet implemented
- Push notifications require additional setup
- Some advanced features from web app pending

## Future Enhancements

- [ ] Advanced reports with charts
- [ ] Invoice PDF generation
- [ ] Push notifications
- [ ] Widgets (iOS 14+, Android 12+)
- [ ] Apple Watch / Wear OS companion apps
- [ ] Dark mode
- [ ] Multi-language support
- [ ] Siri shortcuts / Google Assistant
- [ ] Export to CSV/PDF

## Troubleshooting

### Common Issues

**Metro bundler errors:**
```bash
npm start -- --reset-cache
```

**iOS build fails:**
- Ensure Xcode is updated
- Run `pod install` in ios/ directory
- Check code signing in Xcode

**Android build fails:**
- Update Android Studio
- Check gradle version
- Clean build: `cd android && ./gradlew clean`

**Biometric not working:**
- Ensure device has biometrics enrolled
- Check permissions in app.json
- Test on physical device (simulators may not support)

## Support

For issues or questions:
1. Check the documentation
2. Review GitHub issues
3. Contact support@tradetimer.com

## License

Proprietary - All rights reserved

## Credits

Built with ❤️ using Expo and React Native
