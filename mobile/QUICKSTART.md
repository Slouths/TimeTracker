# TradeTimer Mobile - Quick Start Guide

Get the TradeTimer mobile app running in under 5 minutes!

## Prerequisites Check

Make sure you have:
- [ ] Node.js 18+ installed
- [ ] npm installed
- [ ] iOS Simulator (Mac) OR Android Emulator

## Installation

### 1. Navigate to mobile directory
```bash
cd mobile
```

### 2. Install dependencies (one time)
```bash
npm install
```

This installs all required packages (~5 minutes on first run).

### 3. Create environment file
```bash
cp .env.example .env
```

### 4. Add your Supabase credentials
Edit `.env` and add:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get these from:** Supabase Dashboard → Settings → API

## Running the App

### Start the development server
```bash
npm start
```

You'll see:
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

### Option A: Run on Physical Device

1. **Install Expo Go**
   - iOS: App Store
   - Android: Play Store

2. **Scan QR Code**
   - iOS: Use Camera app
   - Android: Use Expo Go app

### Option B: Run on Simulator/Emulator

**For iOS:**
```bash
npm run ios
```

**For Android:**
```bash
npm run android
```

## First Use

### 1. Sign Up
- Tap "Sign up"
- Enter name, email, password
- Account created!

### 2. Add a Client
- Tap "Clients" tab
- Tap "Add Client"
- Enter name and hourly rate
- Save

### 3. Use the Timer
- Tap "Timer" tab
- Select your client
- Tap "START TIMER"
- Timer starts counting!

### 4. Stop and Save
- Tap "STOP & SAVE"
- Entry is saved
- View in "Entries" tab

## Keyboard Shortcuts (iOS/Android)

While developing:
- **`i`** - Open iOS simulator
- **`a`** - Open Android emulator
- **`r`** - Reload app
- **`m`** - Toggle menu
- **`d`** - Open developer menu

## File Structure Overview

```
mobile/
├── App.tsx              # Main app component
├── src/
│   ├── screens/         # App screens
│   ├── components/      # Reusable components
│   ├── navigation/      # Navigation setup
│   ├── store/          # State management
│   ├── services/       # Supabase, etc.
│   └── utils/          # Helper functions
├── docs/               # Documentation
└── package.json        # Dependencies
```

## Common Commands

```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Clear cache (if issues)
npm start -- --reset-cache

# Install new dependency
npm install package-name
```

## Troubleshooting

### "Expo not found"
```bash
npm install -g expo-cli
```

### "Metro bundler error"
```bash
npm start -- --reset-cache
```

### "Can't find Supabase credentials"
- Check `.env` file exists
- Verify credentials are correct
- Restart Metro bundler

### "iOS simulator not opening"
- Install Xcode from App Store
- Run: `xcode-select --install`

### "Android emulator not opening"
- Install Android Studio
- Set up Android SDK
- Create virtual device

## What's Working

- ✅ Authentication (Login/Signup)
- ✅ Timer (Start/Pause/Resume/Stop)
- ✅ Client Management (Add/Edit/Delete)
- ✅ Time Entries (View all)
- ✅ Settings
- ✅ Biometric Auth (Face ID / Touch ID)

## Next Steps

1. **Read full documentation**
   - `README.md` - Overview
   - `docs/SETUP.md` - Detailed setup
   - `docs/ARCHITECTURE.md` - How it works
   - `docs/DEPLOYMENT.md` - Deploying to stores

2. **Explore the code**
   - Start with `App.tsx`
   - Check `src/screens/timer/TimerScreen.tsx`
   - Look at `src/store/` for state management

3. **Build for production**
   - See `docs/DEPLOYMENT.md`
   - Install EAS CLI
   - Configure builds

## Getting Help

- Check `README.md` for features
- Read `docs/SETUP.md` for detailed setup
- Review `docs/ARCHITECTURE.md` for architecture
- See `MOBILE_APP_COMPLETE.md` for status

## Key Features to Try

1. **Timer**
   - Select client from dropdown
   - Start timer
   - Add notes while running
   - Pause/resume
   - Stop and save

2. **Clients**
   - Add new client
   - Set hourly rate
   - Edit existing
   - Delete (with confirmation)

3. **Biometric Auth** (physical device only)
   - Go to Settings
   - Toggle "Biometric Authentication"
   - Use Face ID / Touch ID to login

4. **Entries**
   - View all time entries
   - See client, duration, amount
   - Sorted by newest first

## Tips

- Use physical device for full experience
- Biometrics only work on real devices
- Haptic feedback feels better on device
- Pull-to-refresh works in lists
- Use search in client selector

## Development Workflow

1. Make changes to code
2. Save file
3. App reloads automatically
4. Test changes
5. Repeat!

## Ready to Deploy?

See `docs/DEPLOYMENT.md` for:
- Building for iOS App Store
- Building for Google Play Store
- Submitting for review
- Managing versions

---

**You're all set!** Start tracking time with TradeTimer Mobile. 🎉
