import type { ActivityEvent, MemoryCandidate, MemoryEvidence } from "./types";
import { clamp01, daysBetween, stableHash, topN } from "./ids";

const CREATIVE_TOOLS = [
  { key: "journal", label: "Journaling" },
  { key: "photo", label: "Photo prompts" },
  { key: "music", label: "Music reflection" },
  { key: "collage", label: "Collage" },
  { key: "ai", label: "Creative AI" },
] as const;

const ROUTINES = [
  { key: "soft-focus", label: "Soft Focus" },
  { key: "color-play", label: "Color Play" },
  { key: "reset", label: "The Reset" },
] as const;

export function generateMemoryCandidates(
  events: ActivityEvent[],
  preferences: Record<string, unknown> = {},
  now = new Date(),
): MemoryCandidate[] {
  return dedupeCandidates([
    ...preferenceCandidates(preferences),
    ...toolCandidates(events, now),
    ...routineCandidates(events, now),
    ...timeCandidates(events),
    ...communityCandidates(events, now),
  ]);
}

function preferenceCandidates(preferences: Record<string, unknown>): MemoryCandidate[] {
  const labels: Record<string, string> = {
    creativity: "Creativity",
    journaling: "Journaling",
    music: "Music",
    community: "Community",
    beauty: "Visual beauty",
  };
  return Object.entries(labels).flatMap(([key, label]) => {
    const value = preferences[key];
    if (typeof value !== "string" || !value.trim()) return [];
    return [{
      key: `preference:${key}:${value}`,
      kind: "preference" as const,
      label,
      value,
      weight: 0.95,
      evidence: [],
      explanation: `You explicitly chose ${value} for ${label.toLowerCase()} in your preferences.`,
    }];
  });
}

function toolCandidates(events: ActivityEvent[], now: Date): MemoryCandidate[] {
  return CREATIVE_TOOLS.flatMap((tool) => {
    const relevant = events.filter((event) =>
      (event.kind === "create.completed" || event.kind === "create.started") &&
      String(event.metadata.toolId ?? "").toLowerCase() === tool.key,
    );
    if (!relevant.length) return [];
    const evidence = relevant.slice(-8).map((event) => makeEvidence(event, scoreRecency(event, now)));
    return [{
      key: `medium:${tool.key}`,
      kind: "creative-medium" as const,
      label: "Creative medium",
      value: tool.label,
      weight: clamp01(0.2 + relevant.length * 0.08 + evidence.reduce((sum, item) => sum + item.weight, 0) / 20),
      evidence,
      explanation: `You have used ${tool.label.toLowerCase()} repeatedly.`,
    }];
  });
}

function routineCandidates(events: ActivityEvent[], now: Date): MemoryCandidate[] {
  return ROUTINES.flatMap((routine) => {
    const relevant = events.filter((event) =>
      (event.kind === "routine.completed" || event.kind === "routine.started") &&
      String(event.metadata.routineId ?? "").toLowerCase() === routine.key,
    );
    if (!relevant.length) return [];
    const completed = relevant.filter((event) => event.kind === "routine.completed").length;
    return [{
      key: `routine:${routine.key}`,
      kind: "routine" as const,
      label: "Ritual",
      value: routine.label,
      weight: clamp01(0.3 + completed * 0.12),
      evidence: relevant.slice(-10).map((event) => makeEvidence(event, scoreRecency(event, now))),
      explanation: completed ? `You have completed ${routine.label} ${completed} time${completed === 1 ? "" : "s"}.` : `You have started ${routine.label}.`,
    }];
  });
}

function timeCandidates(events: ActivityEvent[]): MemoryCandidate[] {
  const buckets = new Map<string, number>();
  for (const event of events) {
    const hour = new Date(event.occurredAt).getHours();
    const bucket = hour < 6 ? "late night" : hour < 10 ? "morning" : hour < 14 ? "late morning" : hour < 18 ? "afternoon" : hour < 22 ? "evening" : "night";
    buckets.set(bucket, (buckets.get(bucket) ?? 0) + 1);
  }
  return topN([...buckets.entries()].map(([bucket, count]) => ({ bucket, count })), (item) => item.count, 2)
    .filter((item) => item.count >= 3)
    .map((item) => ({
      key: `time:${item.bucket}`,
      kind: "time-pattern" as const,
      label: "Active time",
      value: item.bucket,
      weight: clamp01(item.count / Math.max(8, events.length)),
      evidence: [],
      explanation: `Many of your RARELY moments happen in the ${item.bucket}.`,
    }));
}

function communityCandidates(events: ActivityEvent[], now: Date): MemoryCandidate[] {
  const byCircle = new Map<string, ActivityEvent[]>();
  for (const event of events) {
    if (!["circle.joined", "circle.posted", "circle.reacted"].includes(event.kind)) continue;
    const id = String(event.metadata.circleId ?? "");
    if (!id) continue;
    byCircle.set(id, [...(byCircle.get(id) ?? []), event]);
  }
  return topN([...byCircle.entries()], ([, value]) => value.length, 3).map(([circleId, list]) => ({
    key: `community:${circleId}`,
    kind: "community" as const,
    label: "Community",
    value: String(list[0]?.metadata.circleName ?? circleId),
    weight: clamp01(0.25 + list.length * 0.1 + scoreRecency(list.at(-1)!, now) * 0.2),
    evidence: list.slice(-6).map((event) => makeEvidence(event, scoreRecency(event, now))),
    explanation: `You keep returning to ${String(list[0]?.metadata.circleName ?? "this circle")}.`,
  }));
}

function makeEvidence(event: ActivityEvent, weight: number): MemoryEvidence {
  return { eventId: event.id, kind: event.kind, weight: clamp01(weight), occurredAt: event.occurredAt };
}

function scoreRecency(event: ActivityEvent, now: Date): number {
  return Math.exp(-daysBetween(event.occurredAt, now.toISOString()) / 21);
}

function dedupeCandidates(candidates: MemoryCandidate[]): MemoryCandidate[] {
  const byKey = new Map<string, MemoryCandidate>();
  for (const candidate of candidates) {
    const previous = byKey.get(candidate.key);
    if (!previous) {
      byKey.set(candidate.key, candidate);
      continue;
    }
    byKey.set(candidate.key, {
      ...previous,
      weight: clamp01(previous.weight + candidate.weight * 0.25),
      evidence: [...previous.evidence, ...candidate.evidence].slice(-12),
    });
  }
  return [...byKey.values()].map((candidate) => ({ ...candidate, key: `${candidate.key}:${stableHash(candidate.value).slice(0, 8)}` }));
}
