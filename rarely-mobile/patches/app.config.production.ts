import type { ExpoConfig } from 'expo/config';

export const PRODUCTION_CONFIG_PATCH: Partial<ExpoConfig> = {
  name: 'RARELY — Be More You',
  slug: 'rarely-mobile',
  version: '1.0.0',
  scheme: 'rarely',
  ios: {
    bundleIdentifier: process.env.RARELY_IOS_BUNDLE_ID ?? 'com.app.rarelymobile',
    supportsTablet: true,
    usesAppleSignIn: true,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      CFBundleAllowMixedLocalizations: true,
      NSPhotoLibraryUsageDescription: 'RARELY uses photo access only when you choose to add images to creative moments or your scrapbook.',
      NSMicrophoneUsageDescription: 'RARELY uses the microphone only when you choose to record an audio creative moment.',
    },
    ...(process.env.RARELY_ASSOCIATED_DOMAIN ? { associatedDomains: [`applinks:${process.env.RARELY_ASSOCIATED_DOMAIN}`] } : {}),
  },
  plugins: ['expo-router', 'expo-apple-authentication'],
};
