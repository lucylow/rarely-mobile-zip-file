# RARELY final iOS submission gate

This is the merge-and-upload gate after the previous hardening packs and the incremental submission layer.

## 1. Dependency/toolchain gate

The public RARELY repository currently declares Expo SDK 54. The current Apple upload requirement is Xcode 26 or later with an iOS 26 or later SDK. Expo's current matrix documents SDK 57 with Xcode 26.4, so the production path in this pack targets an incremental Expo 54 -> 55 -> 56 -> 57 migration.

Run the following at each major-version step and stop on the first failure:

```text
npx expo install expo@^55.0.0
npx expo install --fix
npx expo-doctor
pnpm check
pnpm lint
pnpm test

npx expo install expo@^56.0.0
npx expo install --fix
npx expo-doctor
pnpm check
pnpm lint
pnpm test

npx expo install expo@^57.0.0
npx expo install --fix
npx expo-doctor
pnpm check
pnpm lint
pnpm test
```

If the app uses Continuous Native Generation, regenerate and review native changes:

```text
npx expo prebuild --clean
```

## 2. Production configuration gate

Replace every placeholder in the templates:

- RARELY_IOS_BUNDLE_ID
- RARELY_PRIVACY_URL
- RARELY_TERMS_URL
- RARELY_SUPPORT_URL
- RevenueCat iOS public SDK key
- App Store Connect app ID
- Apple team ID
- Apple developer signing credentials
- subscription product identifiers
- associated-domain hostnames, if used

The blocker scanner must pass against the real application tree. Template files under `patches/` are examples and must not be imported as production runtime modules until their values are replaced.

## 3. Apple account and identity

Create or verify the App Store Connect app record. Register the bundle ID and configure Sign in with Apple if the app offers third-party sign-in. Verify the Apple capability in the native project after prebuild.

## 4. Subscriptions

Create the subscription group and products in App Store Connect. Configure the same product identifiers in the app and in the RevenueCat/StoreKit layer. Submit the initial subscription products with the new app version as required by App Store Connect.

Test these cases on a real iOS build:

- purchase
- user cancels purchase sheet
- network loss during purchase
- pending transaction
- renewal/entitlement refresh
- Restore Purchases
- expired entitlement
- revoked/refunded transaction
- fresh install with an existing entitlement

## 5. Privacy and data controls

Complete App Privacy in App Store Connect from the actual data flows and third-party SDK inventory. Publish the privacy policy at a stable HTTPS URL. Keep the privacy manifest in the final iOS bundle and verify required-reason API declarations for the actual SDKs you ship.

Verify in-app account deletion if account creation is enabled. Verify export and reset flows, and confirm that sensitive journal content is not sent to AI unless the product flow explicitly obtains the required consent.

## 6. Store metadata

Validate the title, subtitle, keywords, description, promotional text, release notes, support URL, marketing URL if used, privacy URL, age-rating answers, screenshot manifest, and review notes. Screenshots must represent the build submitted for review.

Provide App Review notes for features that require sign-in, paid access, notifications, AI consent, or a specific navigation path.

## 7. Build and TestFlight

Use a production EAS profile and create the store artifact:

```text
eas build --platform ios --profile production
```

Submit the IPA to TestFlight:

```text
eas submit --platform ios --profile production
```

Do a full TestFlight pass on physical hardware before the App Store Connect review submission. Capture the binary version/build number and symbol-upload status in the release report.

## 8. Submission gate

Run the repository's release scripts and resolve every blocker:

```text
node scripts/validate-store-submission.mjs
node scripts/validate-production-env.mjs
node scripts/check-expo-store-compat.mjs
node scripts/check-xcode-upload-gate.mjs
node scripts/scan-for-store-blockers.mjs
node scripts/generate-release-report.mjs
```

The scripts in this pack are intentionally conservative. A failure is a signal to investigate, not a reason to bypass the check.

## 9. App Store Connect

Upload the build, complete the store metadata and App Privacy questionnaire, attach the build to the app version, attach the initial IAP/subscription products where required, add review notes, and submit the version for Apple review.

Code can make these steps easier to verify, but it cannot create Apple-side records or grant an approval result. The final approval remains an Apple review decision.
