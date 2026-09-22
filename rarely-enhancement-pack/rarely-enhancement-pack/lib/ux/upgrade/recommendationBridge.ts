import { clamp01, daysBetween, stableHash } from "./ids";
import type { ActivityEvent, MemoryItem } from "./types";

export interface UpgradeRecommendationProfile {
  interests: Record<string, number>;
  toolPreferences: Record<string, number>;
  timePreferences: Record<string, number>;
  circlePreferences: Record<string, number>;
  explanations: Record<string, string>;
}

export function buildRecommendationProfile(memories: MemoryItem[], events: ActivityEvent[], now = new Date()): UpgradeRecommendationProfile {
  const profile: UpgradeRecommendationProfile = { interests: {}, toolPreferences: {}, timePreferences: {}, circlePreferences: {}, explanations: {} };
  for (const memory of memories) {
    const weight = clamp01(memory.confidence);
    if (memory.kind === "preference") add(profile.interests, memory.value, weight);
    if (memory.kind === "creative-medium") add(profile.toolPreferences, memory.value, weight);
    if (memory.kind === "time-pattern") add(profile.timePreferences, memory.value, weight);
    if (memory.kind === "community") add(profile.circlePreferences, memory.value, weight);
    profile.explanations[memory.key] = memory.explanation;
  }
  for (const event of events.slice(-100)) {
    const recency = Math.exp(-daysBetween(event.occurredAt, now.toISOString()) / 30);
    if (event.kind === "recommendation.fitted") add(profile.interests, String(event.metadata.itemId ?? event.title ?? "unknown"), 0.15 * recency);
    if (event.kind === "recommendation.rejected") add(profile.interests, String(event.metadata.itemId ?? event.title ?? "unknown"), -0.18 * recency);
  }
  return profile;
}

export function scoreCandidate(profile: UpgradeRecommendationProfile, candidate: { id: string; tags?: string[]; toolId?: string; circleId?: string; timeBucket?: string }): { score: number; reason: string } {
  let score = 0;
  const reasons: string[] = [];
  for (const tag of candidate.tags ?? []) {
    const weight = profile.interests[tag] ?? 0;
    if (weight > 0) { score += weight; reasons.push(`you have shown interest in ${tag}`); }
  }
  if (candidate.toolId) {
    const weight = profile.toolPreferences[candidate.toolId] ?? 0;
    score += weight;
    if (weight > 0.2) reasons.push(`you return to ${candidate.toolId}`);
  }
  if (candidate.circleId) {
    const weight = profile.circlePreferences[candidate.circleId] ?? 0;
    score += weight;
    if (weight > 0.2) reasons.push("you interact with this circle");
  }
  if (candidate.timeBucket) {
    const weight = profile.timePreferences[candidate.timeBucket] ?? 0;
    score += weight * 0.5;
    if (weight > 0.2) reasons.push("this fits a time you often use RARELY");
  }
  score += parseInt(stableHash(candidate.id).slice(-2), 16) / 2550;
  return { score, reason: reasons[0] ?? "a small amount of fresh exploration" };
}

function add(target: Record<string, number>, key: string, value: number): void {
  target[key] = clamp01((target[key] ?? 0) + value);
}
