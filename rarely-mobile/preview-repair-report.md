# RARELY Preview Repair Report

## Root cause

The preview timeout originated in **Metro bundling**, before the application’s JavaScript could render. Expo Router eagerly builds a route context for every file under `app/`. During this pass, `app/personalization-history.tsx` imported `@/lib/design/tokens`, but `lib/design/tokens.ts` was absent from the archive. Metro therefore emitted `Unable to resolve module @/lib/design/tokens`, the root document returned **HTTP 500**, and the Manus preview could not finish loading.

A second clean-launch defect was also found in `scripts/generate-assets.mjs`. Its generation dimensions did not agree with its own assertions. On a checkout without the pre-generated assets, `predev` could fail while validating the Android, favicon, and splash files. This did not cause the observed route-context error, but it made a clean preview launch unreliable and was fixed as part of the focused startup repair.

## Scope of the fix

The root layout and Home route were inspected without alteration. They render basic UI immediately; non-critical storage reads happen from effects after the initial render. The Sponsor configuration is already mock-first, and no Sponsor, AI, Xano, SerpApi, notification, authentication, or React Query request is initiated by the root screen. No external provider calls are needed for the tested preview path.

| Changed file | Change |
|---|---|
| `lib/design/tokens.ts` | Added the missing shared static measurements: spacing, radii, compact hit target, and typography tokens consumed by Preferences, Personalization History, and Snackbar. |
| `scripts/generate-assets.mjs` | Aligned newly generated Android assets, favicon, and splash icon dimensions with the validator’s required dimensions. |
| `tests/assets-generator.test.ts` | Added regression coverage that runs the generator into a clean temporary directory and asserts every expected PNG dimension. |

## Code-level effect

The missing token module restores Metro’s complete route graph, including routes that are not initially visible. Correct asset dimensions allow `predev` to complete on an empty asset directory instead of throwing during startup validation. The existing loading safeguards and mock provider behavior were retained unchanged.

## Validation

A fresh Metro launch of the supplied archive first reproduced the failure: the bundle returned **HTTP 500** and Metro reported the missing token module. After the repair, a clean temporary asset generation run completed with all expected dimensions. TypeScript validation completed without errors, and the full Vitest suite passed: **17 files and 135 tests**.

The managed Manus development server was then restarted cleanly. Metro reported successful server rendering and web bundles, with no bundling error. In the live preview, a clean onboarding launch rendered; **Skip** persisted completion and reached Home. The full **Enter RARELY** onboarding path was also exercised after resetting the marker: Begin, choose Creative ideas, Continue, Continue, Enter RARELY, then reopen the root route to confirm persisted completion and Home rendering. Create opened, Sponsor Studio opened from its card, the mock sponsor demo completed all five stages and rendered its results, and the Create and Home tabs returned correctly. The mock demonstration did not require credentials or make real provider calls.

The browser automation runner occasionally returned a timeout after a route-changing click because the clicked DOM element was replaced during navigation. Follow-up route checks confirmed the intended persisted route and rendered screen; this was automation stale-element behavior rather than a frozen application UI.

## Result

The Manus preview now loads reliably from a clean restart. The original timeout was caused by a route-context bundle failure, not by an onboarding button, session restoration, sponsor adapter, font, or external service. The focused fixes eliminate that blocker while preserving the existing RARELY interface and flows.
