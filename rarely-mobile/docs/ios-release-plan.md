# iOS release plan

## 1. App identity

The current repository already has a concrete iOS bundle identifier in `app.config.ts`. Before the first App Store submission, confirm that the bundle identifier in App Store Connect exactly matches the Xcode/EAS build identifier.

Do not ship development-only values, Manus-style development schemes, local API URLs, mock entitlement IDs, or test server endpoints in a production build.

## 2. Native purchase build

Expo Go is not the target for production purchases. The in-app-purchase SDK requires native code, so use an Expo development build or EAS build for purchase testing.

Recommended sequence:

```bash
npx expo install expo-dev-client
npx expo install react-native-purchases react-native-purchases-ui
npx expo prebuild
npx expo run:ios
```

Then switch to a TestFlight/EAS build once the StoreKit configuration is stable.

## 3. Products

Create a single subscription group such as `rarely_plus` with products such as:

- `rarely.plus.monthly`
- `rarely.plus.annual`

Attach both products to one entitlement in the RevenueCat dashboard, e.g. `rarely_plus`.

Do not hard-code prices into the app. Read the localized price from StoreKit / RevenueCat offerings.

## 4. Product value

The paid feature set should have ongoing value, for example expanded creative tools, additional AI generations, advanced scrapbook organization, additional rituals, and cloud continuity. Keep the free tier functional and never block core journaling behind a fake scarcity timer.

## 5. Restore

Provide a visible Restore Purchases control in the membership/settings surface. Do not automatically trigger restore on every launch.

## 6. Account deletion

If the app creates accounts, the product needs a user-visible account deletion path. The path in this pack can queue server-side deletion, wipe local personal state, revoke local session state, and clear purchase identity after server confirmation.

## 7. Privacy

Provide:

- a public privacy policy URL;
- accurate App Privacy answers in App Store Connect;
- a privacy manifest for required-reason APIs used by the app/SDKs;
- settings to control optional analytics and personalized reminders;
- a clear export/delete flow.

## 8. App Store metadata

Prepare app name, subtitle, keywords, description, support URL, privacy policy URL, age rating, screenshots, and IAP metadata. Product IDs and entitlement IDs must be consistent across App Store Connect, RevenueCat, and code.

## 9. Production validation

Run:

```bash
node scripts/validate-ios-release.mjs
node scripts/scan-risky-code.mjs
```

Then build with EAS and install on physical iOS hardware.
