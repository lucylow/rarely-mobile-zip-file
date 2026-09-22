# RARELY iOS Production Hardening Pack

This is an additive release-hardening overlay for the existing `rarely-mobile/` Expo + React Native app.

The goal is to make the existing product safer to run, easier to debug, easier to test with deterministic data, and ready for an Apple App Store monetization path. It deliberately ignores the hackathon submission narrative.

## What is included

- Central error taxonomy with retryability, user-safe messages, recovery actions, and error fingerprints.
- Network timeout, retry, circuit-breaker, stale-cache, idempotency, and offline queue primitives.
- Defensive JSON parsing and storage repair for malformed AsyncStorage records.
- Large deterministic mock data set for moods, Rare Moments, prompts, rituals, circles, posts, journal entries, and purchase states.
- RevenueCat / StoreKit subscription adapter for iOS using a development build.
- Purchase coordinator with serialized transactions, restore purchases, entitlement caching, and graceful failures.
- Account deletion workflow, privacy controls, export/backup integrity checks, and redacted telemetry.
- App startup coordinator that reports degraded dependencies instead of blocking the whole app.
- Media URI validation and fallback resolution.
- Form validation and duplicate-submit protection.
- Auth/session bootstrap recovery and sign-out cleanup.
- Server error middleware, rate limits, webhook verification, idempotency, and subscription entitlement persistence.
- CI scripts and release checks for iOS configuration, environment values, and required privacy metadata.
- Reference release screens for paywall, subscription management, diagnostics, privacy, and account deletion.
- Extensive unit-style test fixtures and test matrices.

## Existing project assumptions

The current public repository is an Expo SDK 54 / React Native 0.81 app using Expo Router, AsyncStorage, React Query, tRPC, Drizzle/MySQL, Zod, and Vitest. The pack targets the documented `app/`, `components/`, `lib/`, `server/`, `drizzle/`, and `tests/` boundaries.

## Important

This pack cannot create your Apple Developer certificates, App Store Connect product records, RevenueCat project, tax/banking setup, privacy policy website, or production secrets. Those are external account/configuration steps.

For digital features sold inside the iOS app, configure App Store In-App Purchases and use StoreKit through a native purchase layer. The recommended integration here uses RevenueCat because it wraps StoreKit and provides entitlement synchronization and webhook infrastructure.
