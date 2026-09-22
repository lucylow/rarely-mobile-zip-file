import type { ActivityEvent } from "./types";
import { stableHash } from "./ids";

export interface TimeBucketStat {
  bucket: string;
  events: number;
  meaningful: number;
  completionRate: number;
}

export interface SourceStat {
  source: ActivityEvent["source"];
  events: number;
  meaningful: number;
}

export function timeBucketStats(events: ActivityEvent[]): TimeBucketStat[] {
  const buckets = new Map<string, { events: number; meaningful: number }>();
  for (const event of events) {
    const hour = new Date(event.occurredAt).getHours();
    const bucket = hour < 6 ? "late night" : hour < 10 ? "morning" : hour < 14 ? "late morning" : hour < 18 ? "afternoon" : hour < 22 ? "evening" : "night";
    const current = buckets.get(bucket) ?? { events: 0, meaningful: 0 };
    current.events += 1;
    if (isMeaningful(event.kind)) current.meaningful += 1;
    buckets.set(bucket, current);
  }
  return [...buckets.entries()].map(([bucket, value]) => ({ bucket, events: value.events, meaningful: value.meaningful, completionRate: value.events ? value.meaningful / value.events : 0 }));
}

export function sourceStats(events: ActivityEvent[]): SourceStat[] {
  const bySource = new Map<ActivityEvent["source"], { events: number; meaningful: number }>();
  for (const event of events) {
    const current = bySource.get(event.source) ?? { events: 0, meaningful: 0 };
    current.events += 1;
    if (isMeaningful(event.kind)) current.meaningful += 1;
    bySource.set(event.source, current);
  }
  return [...bySource.entries()].map(([source, value]) => ({ source, ...value }));
}

export function generatedInsightId(seed: string): string {
  return `insight_${stableHash(seed).slice(0, 14)}`;
}

function isMeaningful(kind: ActivityEvent["kind"]): boolean {
  return ["moment.completed", "create.completed", "journal.saved", "routine.completed", "circle.posted"].includes(kind);
}
