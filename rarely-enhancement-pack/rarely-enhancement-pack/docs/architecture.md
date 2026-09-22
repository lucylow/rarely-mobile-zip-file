# RARELY Upgrade Architecture

The upgrade is organized into six layers.

## 1. Product memory

`memorySignals.ts`, `memory.ts`, and `recommendationBridge.ts` create an editable, explainable layer over explicit
preferences and activity patterns. The memory model stores labels and evidence, not journal content.

## 2. Local events

`eventStore.ts` stores append-only history. `sync.ts` converts eligible events into an outbox. `privacyCenter.ts`
decides what is eligible to cross a network boundary.

## 3. Personal utility

`dailyBrief.ts`, `insights.ts`, `routineEngine.ts`, `notifications.ts`, and `circleChallenges.ts` transform history
into small useful actions without requiring an infinite feed.

## 4. Trust layer

`aiCompanion.ts`, `moderation.ts`, `backup.ts`, `telemetry.ts`, and `privacyLog.ts` make failure and privacy behavior
explicit.

## 5. Server continuity

`enhancementRouter.ts` exposes append, pull, and delete operations for controlled sync. `enhancement-schema.ts` is
isolated so its database migration can be applied independently.

## 6. Presentation

Reference screens and components are intentionally narrow. They demonstrate how the domain modules can be surfaced
without forcing a visual rewrite.

```text
existing RARELY UI
        |
        v
ActivityRecorder
   |         |
   v         v
local     MemoryEngine ----> Brief / Insights / Recommendations
   |
   v
SyncQueue ----> tRPC ----> MySQL append-only event log
```
