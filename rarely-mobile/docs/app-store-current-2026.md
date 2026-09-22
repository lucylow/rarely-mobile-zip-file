# App Store facts verified on 2026-09-22

- Apple states that starting April 28, 2026, App Store Connect uploads must be built with Xcode 26 or later and an iOS 26 or later SDK.
- Apple states that App Privacy information and a privacy policy URL are required for iOS submissions.
- Apple states that apps supporting account creation must provide an in-app account deletion path.
- Expo's current SDK matrix lists SDK 57 / React Native 0.86 / Xcode 26.4 and SDK 54 / React Native 0.81 / Xcode 16.1.
- Expo recommends incremental SDK upgrades, `npx expo install --fix`, `npx expo-doctor`, and native regeneration when using CNG.
- Expo's iOS EAS flow creates a production build, submits it to TestFlight, and then the app is promoted to App Review from App Store Connect.

This document is a release note, not a substitute for checking Apple or Expo again on the day you upload. Store requirements can change.
