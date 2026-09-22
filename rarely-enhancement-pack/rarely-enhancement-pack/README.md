# RARELY Enhancement Pack

This is a drop-in additive upgrade set for the RARELY mobile application. It keeps the existing product surfaces and
adds personal memory, daily briefs, insights, selective synchronization, notification planning, creative AI guards,
community pre-flight moderation, backup/restore, feature flags, privacy auditing, and aggregate product health.

## Why it matches RARELY

The existing product is described as local-first, privacy-conscious, and deliberately modular. This pack extends those
same boundaries instead of replacing them. Product behavior stays in reusable `lib/ux/upgrade` modules, presentation
lives in small React Native components/screens, and server continuity is exposed through a typed tRPC router.

## Main additions

- Personal memory engine with user-visible, editable memories.
- Daily Brief assembled from recent activity, memories, routines, and community affinity.
- Streaks and meaningful-outcome insights instead of raw engagement optimization.
- Append-only local activity store and selective sync outbox.
- Sync cursor/ack protocol with server-side idempotency.
- Notification planner with quiet-hour awareness and stable schedule keys.
- AI companion with consent, minimization, secret-like detection, output validation, and deterministic fallback.
- Community pre-flight moderation with allow/review/block decisions and rewrite suggestions.
- Scrapbook search over safe metadata without requiring private journal text in the index.
- Versioned backup/export/import with integrity checking.
- Local feature flags, telemetry buffer, privacy audit log, and route guards.
- Legacy activity backfill helper.

## Integration

1. Copy the pack into the repository.
2. Add `drizzle/enhancement-schema.ts` to the Drizzle schema loader.
3. Apply `migrations/0001_rarely_enhancements.sql`.
4. Mount `upgradeRouter` in the existing `appRouter`.
5. Construct `createUpgradeService` beside the existing QueryClient/tRPC infrastructure.
6. Add `UpgradeActivityRecorder` calls to Home/Create/Community/Studio/Profile/Journal actions.
7. Keep journal content private by default; never depend on server sync for journal value.
8. Add the reference screens only after gating them with the provided feature flags.

`MANIFEST.json` contains exact source counts. The pack is intentionally larger than a small patch and is designed to
cover the full product loop from activity capture through memory, recommendations, continuity, and diagnostics.
