# Integration Guide

## Activity instrumentation

The upgrade layer uses a small `ActivityEvent` envelope. Existing screens only need to call one helper:

```ts
await recorder.record({
  kind: "moment.completed",
  source: "home",
  title: moment.title,
  metadata: { moodId, momentId },
});
```

The recorder writes locally first. It then places a compact sync event into the outbox only when the privacy policy
allows the event.

## Root layout

Construct the upgrade service next to existing app-wide providers:

```tsx
const upgrade = useMemo(
  () => createUpgradeService({ storage: createExpoUpgradeStorage() }),
  [],
);

useEffect(() => {
  void hydrateUpgradeService(upgrade);
}, [upgrade]);
```

The service is framework-agnostic. React owns lifecycle; domain modules own behavior.

## Existing RARELY modules

This pack is intended to cooperate with the app's current personalization, journal persistence, AI safety,
monetization, motion, haptics, and route behavior modules. Do not create a second source of truth for those features.
Use `recommendationBridge.ts` to feed the upgrade memory model into the existing personalization profile.

## Sync

The sync path is selective and append-only:

```text
local event -> privacy policy -> outbox -> tRPC -> server event log
                                                   |
                                                   v
                                            optional pull stream
```

The outbox contains metadata, not journal bodies. A server failure leaves local state intact.

## AI companion

Pass short creative instructions, not private journal dumps. `AiCompanion` will reject consent-free or secret-like
requests and return a deterministic creative fallback when a provider is unavailable.

## Notifications

`NotificationPlanner` is separate from the native Expo adapter. This makes testing deterministic and lets a deployment
supply another scheduler if the native notification package is not included.

## Backup

Use `buildExport` for user-initiated exports. The default example omits private journal entries. Imports are versioned,
integrity checked, and mergeable by stable identifiers.

## Community

Run `moderateCommunityPost` before sending a post. Review is a separate state from block. The result is designed to
help the composer rewrite, not to act as an opaque punishment engine.
