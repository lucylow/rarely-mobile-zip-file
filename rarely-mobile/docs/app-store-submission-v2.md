# RARELY — iOS App Store submission checklist

This pack intentionally ignores the hackathon submission. It is focused on the production iOS release path.

## 1. Apple-side setup

1. Register the production Bundle ID in Apple Developer.
2. Enable Sign in with Apple if the iOS app offers third-party sign-in providers.
3. Create an App Store Connect app record with the exact bundle identifier.
4. Create the auto-renewable subscription group and products `rarely.premium.monthly` and `rarely.premium.annual`.
5. Configure pricing, localization, availability, and review information for each subscription.
6. Complete App Privacy answers, including third-party SDK data practices.
7. Add the public Privacy Policy URL and Support URL.
8. Complete export compliance and content rights questions.
9. Add App Store screenshots, app description, keywords, subtitle, age rating, and contact/review notes.
10. Create a TestFlight test plan before submitting production review.

## 2. Code-side release gates

The production build must not contain mock purchases, development-only menus, test endpoints, placeholder domains, or placeholder credentials.

Account deletion must be discoverable in the app. If the app creates accounts, the production UI needs a direct account deletion flow rather than only account deactivation.

Restore Purchases must be accessible on the membership screen. The app must treat pending, cancelled, and failed StoreKit states separately so a tap that does not complete a transaction does not accidentally unlock premium access.

## 3. Expo/EAS path

Use a development build for native purchase/authentication testing and a production EAS profile for App Store/TestFlight builds.

Typical final commands:

```text
eas build --platform ios --profile production
eas submit --platform ios --profile production
```

EAS Submit uploads to TestFlight first; final App Store review is completed in App Store Connect.

## 4. Replace placeholders

Before building, replace:

- `com.yourcompany.rarely`
- `YOUR_APP_DOMAIN.example.com`
- `https://yourdomain.com/privacy`
- `https://yourdomain.com/terms`
- `https://yourdomain.com/support`
- `appl_xxxxxxxxxxxxxxxxxxxxxxxx`
- `YOUR_APPLE_ID`
- `YOUR_APP_STORE_CONNECT_APP_ID`
- `YOUR_APPLE_TEAM_ID`

## 5. Test the rejection matrix

Before upload, manually exercise:

- first launch with no network;
- expired session;
- malformed local storage;
- denied notification permission;
- denied photo permission;
- denied microphone permission;
- AI timeout and malformed AI result;
- purchase cancellation;
- purchase pending;
- purchase failure;
- restore with an active subscription;
- restore with no subscription;
- account deletion with active subscription;
- account deletion when the server is temporarily unavailable;
- opening a notification/deep link after a cold start;
- opening a revoked/invalid deep link;
- large Dynamic Type and VoiceOver flows;
- reinstall/upgrade while local journal drafts exist.
