# RARELY release v2 merge order

1. Upgrade Expo SDK incrementally until the project uses a store-compatible toolchain.
2. Merge build/environment gates.
3. Merge auth hardening and Sign in with Apple capability.
4. Merge StoreKit/RevenueCat purchase state and restore handling.
5. Merge privacy/permission policy and privacy-manifest audit.
6. Merge local storage recovery and journal autosave.
7. Merge sync engine v2 and conflict handling.
8. Merge community moderation/reporting.
9. Merge AI safety/budget/fallback modules.
10. Merge analytics allowlist/redaction.
11. Merge mock data and deterministic failure scenarios.
12. Run typecheck, lint, tests, Expo dependency validation, Expo Doctor, production environment validation, blocker scan, and a real-device TestFlight build.

The merge is intentionally ordered so store configuration is validated before production networking or monetization is exposed to a real build.
