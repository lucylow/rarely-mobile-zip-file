# RARELY incremental 100+ page submission layer

This layer is intentionally additive. It strengthens the previous iOS hardening pack with App Store metadata validation, localization coverage, screenshot manifests, release-note checks, demo review scenarios, artifact integrity, native capability audits, symbol upload gates, StoreKit purchase recovery, Apple sign-in state handling, permission audits, accessibility helpers, dynamic type, reduce-motion policy, launch recovery, migrations, universal links, privacy inventory, transport policy, analytics buffering, notification tap safety, media checks, UGC policy, server contracts, and large deterministic reviewer mocks.

The code is designed to be merged under `rarely-mobile/src/release/v2/submission` and selectively wired into the existing app. It does not pretend that code can create Apple certificates, App Store Connect records, subscription products, or reviewer accounts. Those are external release setup steps.

Before uploading:

1. Upgrade the existing Expo 54 project to a supported SDK/toolchain for the current Apple submission requirement.
2. Replace every template bundle ID, privacy URL, and purchase product ID.
3. Configure the Apple Developer account and App Store Connect.
4. Configure StoreKit/RevenueCat products and test in TestFlight.
5. Run the release scripts and do a real-device smoke test.
