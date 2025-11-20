require('dotenv').config();

module.exports = {
  expo: {
    name: "TradeTimer - Time Tracking",
    slug: "tradetimer",
    version: "1.0.0",
    owner: "your-expo-username",
    orientation: "portrait",
    userInterfaceStyle: "light",
    assetBundlePatterns: ["**/*"],
    ios: {
      bundleIdentifier: "com.tradetimer.app",
      buildNumber: "1",
      supportsTablet: true,
      infoPlist: {
        NSFaceIDUsageDescription: "Use Face ID to securely login to your TradeTimer account",
        NSCameraUsageDescription: "Take photos for time entry notes (optional feature)",
        NSPhotoLibraryUsageDescription: "Select photos for time entry notes (optional feature)"
      },
      config: {
        usesNonExemptEncryption: false
      }
    },
    android: {
      package: "com.tradetimer.app",
      versionCode: 1,
      permissions: [
        "USE_BIOMETRIC",
        "USE_FINGERPRINT",
        "VIBRATE"
      ]
    },
    web: {},
    plugins: [
      "expo-notifications",
      [
        "expo-local-authentication",
        {
          faceIDPermission: "Allow TradeTimer to use Face ID."
        }
      ],
      "expo-asset",
      "expo-font"
    ],
    extra: {
      eas: {
        projectId: "your-project-id-here"
      },
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      posthogKey: process.env.EXPO_PUBLIC_POSTHOG_KEY,
      posthogHost: process.env.EXPO_PUBLIC_POSTHOG_HOST,
      sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      appEnv: process.env.EXPO_PUBLIC_APP_ENV
    }
  }
};
