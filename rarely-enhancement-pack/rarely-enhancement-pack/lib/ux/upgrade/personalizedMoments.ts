import { scoreCandidate, buildRecommendationProfile } from "./recommendationBridge";
import type { ActivityEvent, MemoryItem } from "./types";

export interface MomentCandidate {
  id: string;
  title: string;
  description: string;
  tags: string[];
  toolId?: string;
  timeBucket?: string;
  minutes: number;
}

export interface RankedMoment extends MomentCandidate {
  score: number;
  reason: string;
}

export function rankMoments(events: ActivityEvent[], memories: MemoryItem[], candidates: MomentCandidate[], limit = 5): RankedMoment[] {
  const profile = buildRecommendationProfile(memories, events);
  return candidates.map((candidate) => {
    const result = scoreCandidate(profile, candidate);
    return { ...candidate, score: result.score, reason: result.reason };
  }).sort((a, b) => b.score - a.score).slice(0, limit);
}

export function suppressRejectedMoments(events: ActivityEvent[], candidates: MomentCandidate[]): MomentCandidate[] {
  const rejected = new Set(events.filter((event) => event.kind === "recommendation.rejected").map((event) => String(event.metadata.itemId ?? "")));
  return candidates.filter((candidate) => !rejected.has(candidate.id));
}

export const DEFAULT_MOMENTS: MomentCandidate[] = [
  { id: "write-wonder", title: "I wonder…", description: "Write one line beginning with I wonder.", tags: ["journaling", "creative"], toolId: "journal", minutes: 3 },
  { id: "color-hunt", title: "Color hunt", description: "Notice one color worth remembering.", tags: ["visual", "creative"], toolId: "photo", minutes: 5 },
  { id: "song-memory", title: "One song, one memory", description: "Pair a song with a moment you want to keep.", tags: ["music", "reflection"], toolId: "music", minutes: 7 },
  { id: "texture-collage", title: "Texture trio", description: "Collect three textures in a tiny collage.", tags: ["collage", "visual"], toolId: "collage", minutes: 10 },
  { id: "gentle-reset", title: "The tiny reset", description: "Breathe, notice, and choose one next thing.", tags: ["gentle", "reset"], minutes: 5 },
];
