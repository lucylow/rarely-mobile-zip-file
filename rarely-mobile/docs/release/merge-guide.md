# Merge guide

1. Copy `lib/release` into `rarely-mobile/lib/release`.
2. Copy `components/release` into `rarely-mobile/components/release`.
3. Copy `app/release` into `rarely-mobile/app/release`.
4. Copy `server/release` into `rarely-mobile/server/release`.
5. Apply `drizzle/0002_rarely_ios_release.sql` using the project's migration process.
6. Merge `patches/eas.json` into the existing EAS configuration rather than replacing any project-specific values.
7. Install RevenueCat with `npx expo install react-native-purchases react-native-purchases-ui`.
8. Add an App Store subscription group and products; use the exact IDs in `lib/release/purchases/productIds.ts` or change that file to your final IDs.
9. Configure the RevenueCat Apple API key as `EXPO_PUBLIC_REVENUECAT_APPLE_KEY` through EAS environment variables, not committed source.
10. Register the RevenueCat webhook endpoint on your server and set a strong Authorization header or HMAC signing secret.
11. Wire your existing root layout to initialize RevenueCat after authentication has been resolved.
12. Wire the existing Profile/Membership route to the paywall and Customer Center.
13. Add the account deletion route to the existing Preferences/Profile navigation.
14. Run release tests and an iOS development build before TestFlight.

## Integration rule

Do not gate the entire app behind RevenueCat startup. If the store SDK fails to initialize, the free RARELY experience should remain usable, while paid features report `ENTITLEMENT_UNKNOWN` or `PURCHASE_UNAVAILABLE` with a retry path.

## Purchase wiring

The reference paywall now selects the native RevenueCat gateway for production and uses the mock gateway only when `EXPO_PUBLIC_RARELY_ENABLE_MOCKS=true` in a development build. Never set that flag in production.
