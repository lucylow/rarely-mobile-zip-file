import { stableHash, daysBetween } from "./ids";
import type { ActivityEvent } from "./types";

export interface ProductHealth {
  meaningfulSessions: number;
  creativeCompletionRate: number;
  recommendationFitRate: number;
  reflectionDays: number;
  healthyExitRate: number;
}

export interface FunnelStep {
  key: string;
  count: number;
  rateFromPrevious: number;
}

export function calculateProductHealth(events: ActivityEvent[]): ProductHealth {
  const sessions = groupSessions(events);
  const valuable = sessions.filter((session) => session.some((event) => ["moment.completed", "create.completed", "journal.saved", "routine.completed", "circle.posted"].includes(event.kind)));
  const creativeStarted = events.filter((event) => event.kind === "create.started").length;
  const creativeCompleted = events.filter((event) => event.kind === "create.completed").length;
  const viewed = events.filter((event) => event.kind === "moment.viewed").length;
  const fitted = events.filter((event) => event.kind === "recommendation.fitted").length;
  const reflectionDays = new Set(events.filter((event) => event.kind === "journal.saved").map((event) => event.occurredAt.slice(0, 10))).size;
  return {
    meaningfulSessions: valuable.length,
    creativeCompletionRate: safeRate(creativeCompleted, creativeStarted),
    recommendationFitRate: safeRate(fitted, viewed),
    reflectionDays,
    healthyExitRate: safeRate(valuable.length, sessions.length),
  };
}

export function funnel(events: ActivityEvent[]): FunnelStep[] {
  const steps = [["mood", "mood.checked"], ["moment", "moment.viewed"], ["complete", "moment.completed"], ["feedback", "recommendation.fitted"]] as const;
  let previous = Math.max(1, events.length);
  return steps.map(([key, kind]) => {
    const count = events.filter((event) => event.kind === kind).length;
    const rateFromPrevious = safeRate(count, previous);
    previous = Math.max(1, count);
    return { key, count, rateFromPrevious };
  });
}

export function activityEntropy(events: ActivityEvent[]): number {
  const counts = new Map<string, number>();
  for (const event of events) counts.set(event.kind, (counts.get(event.kind) ?? 0) + 1);
  const total = events.length || 1;
  let entropy = 0;
  for (const count of counts.values()) {
    const p = count / total;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

export function topActivityDays(events: ActivityEvent[], limit = 7): Array<{ day: string; count: number }> {
  const byDay = new Map<string, number>();
  for (const event of events) byDay.set(event.occurredAt.slice(0, 10), (byDay.get(event.occurredAt.slice(0, 10)) ?? 0) + 1);
  return [...byDay.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([day, count]) => ({ day, count }));
}

export function deterministicExperimentBucket(experiment: string, userKey: string): number {
  return parseInt(stableHash(`${experiment}:${userKey}`).slice(0, 8), 16) / 0xffffffff;
}

function groupSessions(events: ActivityEvent[]): ActivityEvent[][] {
  const sorted = [...events].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt));
  const groups: ActivityEvent[][] = [];
  for (const event of sorted) {
    const previous = groups.at(-1)?.at(-1);
    const gap = previous ? Date.parse(event.occurredAt) - Date.parse(previous.occurredAt) : Number.POSITIVE_INFINITY;
    if (!previous || gap > 30 * 60 * 1000 || daysBetween(previous.occurredAt, event.occurredAt) > 0) groups.push([event]);
    else groups.at(-1)!.push(event);
  }
  return groups;
}

function safeRate(numerator: number, denominator: number): number { return denominator ? numerator / denominator : 0; }
