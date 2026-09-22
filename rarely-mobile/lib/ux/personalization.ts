import type { Preferences } from "./onboardingPersonalization";
import { getAiPromptPolicy } from "./aiPrompts";

export type LocalActivitySummary = {
  journalCount: number;
  momentCount: number;
  circleCount: number;
  routineCount: number;
  lastActivityAt?: string;
};

export type PersonalizationProfile = {
  topInterestKey: keyof Omit<Preferences, "notifications" | "quietHours">;
  topInterestLabel: string;
  totalMemories: number;
  recentActivity: boolean;
  preferredCreateTools: string[];
  quietHours: boolean;
};

const interestLabels: Record<PersonalizationProfile["topInterestKey"], string> = {
  creativity: "your creativity",
  journaling: "your reflections",
  music: "your soundtrack",
  community: "your connections",
  beauty: "your rituals",
};

const toolPreferenceWeights: Record<string, (preferences: Preferences) => number> = {
  journal: (preferences) => preferences.journaling + preferences.creativity * 0.35,
  photo: (preferences) => preferences.creativity + preferences.beauty * 0.2,
  music: (preferences) => preferences.music,
  collage: (preferences) => preferences.creativity + preferences.beauty * 0.25,
  ai: (preferences) => preferences.creativity + preferences.journaling * 0.15,
};

function isValidDateString(value: string | undefined): value is string {
  if (!value) return false;
  return Number.isFinite(Date.parse(value));
}

export function summarizeLocalActivity(summary: LocalActivitySummary): LocalActivitySummary {
  const timestamps = [summary.lastActivityAt].filter(isValidDateString);
  return {
    journalCount: Math.max(0, summary.journalCount),
    momentCount: Math.max(0, summary.momentCount),
    circleCount: Math.max(0, summary.circleCount),
    routineCount: Math.max(0, summary.routineCount),
    lastActivityAt: timestamps[0],
  };
}

export function buildPersonalizationProfile(preferences: Preferences, summary: LocalActivitySummary): PersonalizationProfile {
  const keys = (Object.keys(interestLabels) as PersonalizationProfile["topInterestKey"][]);
  const topInterestKey = [...keys].sort((a, b) => preferences[b] - preferences[a])[0] ?? "creativity";
  const totalMemories = summary.journalCount + summary.momentCount + summary.circleCount + summary.routineCount;
  const lastActivity = isValidDateString(summary.lastActivityAt) ? new Date(summary.lastActivityAt).getTime() : 0;
  const recentActivity = Boolean(lastActivity && Date.now() - lastActivity < 1000 * 60 * 60 * 24 * 7);
  const preferredCreateTools = Object.entries(toolPreferenceWeights)
    .sort(([, scoreA], [, scoreB]) => scoreB(preferences) - scoreA(preferences))
    .map(([tool]) => tool);
  return { topInterestKey, topInterestLabel: interestLabels[topInterestKey], totalMemories, recentActivity, preferredCreateTools, quietHours: preferences.quietHours };
}

export function personalizedRationale(profile: PersonalizationProfile, moodLabel: string): string {
  if (profile.recentActivity && profile.totalMemories > 0) {
    return `A ${moodLabel.toLowerCase()} moment shaped around ${profile.topInterestLabel}, building gently on the story you have already started here.`;
  }
  return `A ${moodLabel.toLowerCase()} moment shaped around ${profile.topInterestLabel}, with room to make it your own.`;
}

export function timeOfDayLabel(hour = new Date().getHours()): string {
  const safeHour = Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.floor(hour))) : 12;
  if (safeHour < 12) return "morning";
  if (safeHour < 18) return "afternoon";
  return "evening";
}

export function timeAwarePrompt(profile: PersonalizationProfile, hour = new Date().getHours()): string {
  if (profile.quietHours) return `A gentle pause for ${profile.topInterestLabel}.`;
  const time = timeOfDayLabel(hour);
  if (time === "morning") return `A gentle ${time} start for ${profile.topInterestLabel}.`;
  if (time === "evening") return `A softer ${time} ritual for ${profile.topInterestLabel}.`;
  return `A small ${time} pause for ${profile.topInterestLabel}.`;
}

export function personalizedCreatePrompt(profile: PersonalizationProfile): string {
  if (profile.totalMemories >= 5) return `Your scrapbook is becoming a palette. Start with ${profile.topInterestLabel}.`;
  if (profile.totalMemories > 0) return `Keep building your private collection with ${profile.topInterestLabel}.`;
  return `Start with ${profile.topInterestLabel}.`;
}

export type AiCreativeMode = "spark" | "reflect" | "play";

export const aiCreativeModes: Array<{ id: AiCreativeMode; label: string; description: string }> = [
  { id: "spark", label: "Spark", description: "A fresh creative question" },
  { id: "reflect", label: "Reflect", description: "A gentle noticing prompt" },
  { id: "play", label: "Play", description: "A light imaginative prompt" },
];

export function personalizedAiPrompt(profile: PersonalizationProfile, mode: AiCreativeMode = "spark"): string {
  const privacyBoundary = getAiPromptPolicy(mode).privacyBoundary;
  if (profile.quietHours) {
    const quietModeCopy: Record<AiCreativeMode, string> = {
      spark: "Offer one gentle creative question",
      reflect: "Offer one gentle noticing question",
      play: "Offer one gentle imaginative question",
    };
    return `${quietModeCopy[mode]} for ${profile.topInterestLabel}. Keep it calm, optional, and easy to answer in a few words. ${privacyBoundary}`;
  }
  const modeCopy: Record<AiCreativeMode, string> = {
    spark: "Offer one surprising but kind creative question",
    reflect: "Offer one grounded reflection question",
    play: "Offer one playful imaginative question",
  };
  const context = profile.recentActivity && profile.totalMemories > 0
    ? "inspired by the feeling of making something new without mentioning any private memories"
    : "that invites play without assuming anything personal";
  return `${modeCopy[mode]} for ${profile.topInterestLabel}, ${context}. Keep it low-pressure and optional. ${privacyBoundary}`;
}

export type AiPromptRefinement = "gentler" | "shorter" | "morePlayful";

export function refineAiPrompt(prompt: string, refinement: AiPromptRefinement): string {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) return "Start with one small, honest detail from this moment.";
  const prefix: Record<AiPromptRefinement, string> = {
    gentler: "Keep this gentle and optional:",
    shorter: "Keep this to one simple question:",
    morePlayful: "Make this a little more playful while staying kind:",
  };
  return `${prefix[refinement]} ${cleanPrompt}`;
}

export function fallbackAiPrompt(mode: AiCreativeMode = "spark"): string {
  const fallback: Record<AiCreativeMode, string> = {
    spark: "What is one small idea you would enjoy exploring today?",
    reflect: "What is one detail from this moment worth noticing?",
    play: "If today had a surprising color or sound, what would it be?",
  };
  return fallback[mode];
}

export type RecommendationFeedbackSignal = {
  fits?: number;
  dismissed?: number;
  lastFitsAt?: string;
  lastDismissedAt?: string;
};

export type RecommendationFeedback = Record<string, RecommendationFeedbackSignal>;
type RecommendationScope = "mood" | "create" | "circle" | "routine";
export type RecommendationConfidence = "low" | "medium" | "high";
export type RecommendationSummary = {
  fits: number;
  dismissed: number;
  net: number;
  recentSignals: number;
  confidence: RecommendationConfidence;
};

export function recommendationKey(scope: "mood" | "circle" | "routine" | "create", id: string): string {
  const normalizedId = id.trim() || "unknown";
  return `${scope}:${normalizedId}`;
}

function validIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return Number.isFinite(Date.parse(normalized)) ? normalized : undefined;
}

function validCount(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (value <= 0) return undefined;
  return Math.floor(value);
}

export function normalizeRecommendationFeedback(feedback: unknown): RecommendationFeedback {
  if (!feedback || typeof feedback !== "object") return {};
  const source = feedback as Record<string, unknown>;
  const normalized: RecommendationFeedback = {};
  for (const [rawKey, rawSignal] of Object.entries(source)) {
    const key = rawKey.trim();
    if (!key || !rawSignal || typeof rawSignal !== "object") continue;
    const signal = rawSignal as Record<string, unknown>;
    const fits = validCount(signal.fits);
    const dismissed = validCount(signal.dismissed);
    const lastFitsAt = validIsoDate(signal.lastFitsAt);
    const lastDismissedAt = validIsoDate(signal.lastDismissedAt);
    if (!fits && !dismissed && !lastFitsAt && !lastDismissedAt) continue;
    normalized[key] = { fits, dismissed, lastFitsAt, lastDismissedAt };
  }
  return normalized;
}

function recommendationScopeForKey(key: string): RecommendationScope | null {
  const scope = key.split(":")[0];
  if (scope === "mood" || scope === "create" || scope === "circle" || scope === "routine") return scope;
  return null;
}

function recencyBoost(at: string | undefined, positive: boolean): number {
  if (!at) return 0;
  const timestamp = new Date(at).getTime();
  if (!Number.isFinite(timestamp)) return 0;
  const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
  if (ageInDays <= 7) return positive ? 1.25 : -1.5;
  if (ageInDays <= 21) return positive ? 0.75 : -0.9;
  if (ageInDays <= 45) return positive ? 0.35 : -0.45;
  return 0;
}

function feedbackStalenessWeight(signal: RecommendationFeedbackSignal): number {
  const timestamps = [signal.lastFitsAt, signal.lastDismissedAt]
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter((value) => Number.isFinite(value));
  if (!timestamps.length) return 1;
  const mostRecent = Math.max(...timestamps);
  const ageInDays = (Date.now() - mostRecent) / (1000 * 60 * 60 * 24);
  if (ageInDays <= 14) return 1;
  if (ageInDays <= 45) return 0.8;
  if (ageInDays <= 90) return 0.55;
  return 0.3;
}

function feedbackScoreForKey(feedback: RecommendationFeedback, key: string): number {
  const signal = feedback[key] ?? {};
  const base = ((signal.fits ?? 0) * 2 - (signal.dismissed ?? 0) * 3) * feedbackStalenessWeight(signal);
  const recency = recencyBoost(signal.lastFitsAt, true) + recencyBoost(signal.lastDismissedAt, false);
  return base + recency;
}

function rankWithFeedbackByKey<T>(items: T[], feedback: RecommendationFeedback, keyForItem: (item: T) => string): T[] {
  return [...items].sort((a, b) => feedbackScoreForKey(feedback, keyForItem(b)) - feedbackScoreForKey(feedback, keyForItem(a)));
}

export function rankWithFeedback<T extends { id: string }>(items: T[], feedback: RecommendationFeedback): T[] {
  return rankWithFeedbackByKey(items, feedback, (item) => item.id);
}

export function applyRecommendationFeedback(
  feedback: RecommendationFeedback,
  key: string,
  kind: "fits" | "dismissed",
  at = new Date().toISOString(),
): RecommendationFeedback {
  const current = feedback[key] ?? {};
  if (kind === "fits") {
    return {
      ...feedback,
      [key]: {
        ...current,
        fits: (current.fits ?? 0) + 1,
        lastFitsAt: at,
      },
    };
  }
  return {
    ...feedback,
    [key]: {
      ...current,
      dismissed: (current.dismissed ?? 0) + 1,
      lastDismissedAt: at,
    },
  };
}

export function selectedFeedbackKind(
  feedback: RecommendationFeedback,
  key: string,
): "fits" | "dismissed" | null {
  const signal = feedback[key];
  if (!signal) return null;
  const lastFits = signal.lastFitsAt ? Date.parse(signal.lastFitsAt) : Number.NaN;
  const lastDismissed = signal.lastDismissedAt ? Date.parse(signal.lastDismissedAt) : Number.NaN;
  if (Number.isFinite(lastFits) || Number.isFinite(lastDismissed)) {
    return (lastFits || 0) >= (lastDismissed || 0) ? "fits" : "dismissed";
  }
  if ((signal.fits ?? 0) > (signal.dismissed ?? 0)) return "fits";
  if ((signal.dismissed ?? 0) > (signal.fits ?? 0)) return "dismissed";
  return null;
}

function isRecent(at: string | undefined, withinDays: number): boolean {
  if (!at) return false;
  const timestamp = new Date(at).getTime();
  if (!Number.isFinite(timestamp)) return false;
  return Date.now() - timestamp <= withinDays * 24 * 60 * 60 * 1000;
}

export function summarizeRecommendationFeedback(feedback: RecommendationFeedback, key: string): RecommendationSummary {
  const signal = feedback[key] ?? {};
  const fits = signal.fits ?? 0;
  const dismissed = signal.dismissed ?? 0;
  const total = fits + dismissed;
  const net = fits - dismissed;
  const recentSignals = (isRecent(signal.lastFitsAt, 21) ? 1 : 0) + (isRecent(signal.lastDismissedAt, 21) ? 1 : 0);
  const scope = recommendationScopeForKey(key);
  const thresholds = scope === "mood"
    ? { highTotal: 3, highNet: 2, mediumTotal: 1 }
    : scope === "circle"
      ? { highTotal: 3, highNet: 2, mediumTotal: 2 }
      : scope === "create"
        ? { highTotal: 4, highNet: 3, mediumTotal: 2 }
        : scope === "routine"
          ? { highTotal: 4, highNet: 3, mediumTotal: 2 }
          : { highTotal: 4, highNet: 3, mediumTotal: 2 };
  const confidence: RecommendationConfidence = total >= thresholds.highTotal || Math.abs(net) >= thresholds.highNet
    ? "high"
    : total >= thresholds.mediumTotal
      ? "medium"
      : "low";
  return { fits, dismissed, net, recentSignals, confidence };
}

export function isRecommendationExploring(feedback: RecommendationFeedback, key: string): boolean {
  return summarizeRecommendationFeedback(feedback, key).confidence === "low";
}

function signalVolume(summary: RecommendationSummary): number {
  return summary.fits + summary.dismissed;
}

function applyConfidenceAwareExploration<T>(
  ranked: T[],
  feedback: RecommendationFeedback,
  keyForItem: (item: T) => string,
): T[] {
  if (ranked.length < 3) return ranked;
  const topSummary = summarizeRecommendationFeedback(feedback, keyForItem(ranked[0]));
  if (topSummary.confidence !== "low") return ranked;
  const tail = ranked.slice(1);
  const unseen = tail.filter((item) => signalVolume(summarizeRecommendationFeedback(feedback, keyForItem(item))) === 0);
  const candidate = unseen[0];
  if (!candidate) return ranked;
  return [ranked[0], candidate, ...tail.filter((item) => item !== candidate)];
}

export function rankMoodOptions<T extends { id: string }>(moods: T[], feedback: RecommendationFeedback = {}): T[] {
  const ranked = rankWithFeedbackByKey(moods, feedback, (mood) => recommendationKey("mood", mood.id));
  return applyConfidenceAwareExploration(ranked, feedback, (mood) => recommendationKey("mood", mood.id));
}

export function rankCommunityCircles<T extends { id: string }>(circles: T[], profile: PersonalizationProfile, feedback: RecommendationFeedback = {}): T[] {
  const preferred = profile.topInterestKey === "community" ? ["creative", "confidence", "music"] : profile.topInterestKey === "music" ? ["music", "creative", "confidence"] : ["creative", "music", "confidence"];
  const order = new Map(preferred.map((id, index) => [id, index]));
  const sorted = [...circles].sort((a, b) => (order.get(a.id) ?? circles.length) - (order.get(b.id) ?? circles.length));
  const ranked = rankWithFeedbackByKey(sorted, feedback, (circle) => recommendationKey("circle", circle.id));
  return applyConfidenceAwareExploration(ranked, feedback, (circle) => recommendationKey("circle", circle.id));
}

export function rankRoutines<T extends { id: string }>(routines: T[], profile: PersonalizationProfile, feedback: RecommendationFeedback = {}): T[] {
  const preferred = profile.topInterestKey === "beauty" ? ["soft", "reset", "color"] : profile.topInterestKey === "creativity" ? ["color", "soft", "reset"] : ["soft", "color", "reset"];
  const order = new Map(preferred.map((id, index) => [id, index]));
  const sorted = [...routines].sort((a, b) => (order.get(a.id) ?? routines.length) - (order.get(b.id) ?? routines.length));
  const ranked = rankWithFeedbackByKey(sorted, feedback, (routine) => recommendationKey("routine", routine.id));
  return applyConfidenceAwareExploration(ranked, feedback, (routine) => recommendationKey("routine", routine.id));
}

export function rankCreateTools<T extends { id: string }>(tools: T[], profile: PersonalizationProfile, feedback: RecommendationFeedback = {}): T[] {
  const order = new Map(profile.preferredCreateTools.map((id, index) => [id, index]));
  const sorted = [...tools].sort((a, b) => (order.get(a.id) ?? tools.length) - (order.get(b.id) ?? tools.length));
  const ranked = rankWithFeedbackByKey(sorted, feedback, (tool) => recommendationKey("create", tool.id));
  return applyConfidenceAwareExploration(ranked, feedback, (tool) => recommendationKey("create", tool.id));
}

const scopeLabels: Record<string, string> = {
  mood: "mood suggestions",
  create: "Create ideas",
  circle: "circle recommendations",
  routine: "routine recommendations",
};

const moodLabels: Record<string, string> = {
  happy: "Happy",
  stressed: "Stressed",
  creative: "Creative",
  tired: "Tired",
  excited: "Excited",
  vibing: "Just vibing",
};

const createLabels: Record<string, string> = {
  journal: "Journal",
  photo: "Photo prompt",
  music: "Music mood",
  collage: "Collage",
  ai: "Rare AI",
};

const circleLabels: Record<string, string> = {
  creative: "Make Room for Ideas",
  confidence: "Soft Confidence",
  music: "The Listening Room",
};

const routineLabels: Record<string, string> = {
  soft: "Soft focus",
  color: "Color play",
  reset: "The reset",
};

function recommendationItemLabel(scope: string, id: string): string {
  if (scope === "mood") return moodLabels[id] ?? id;
  if (scope === "create") return createLabels[id] ?? id;
  if (scope === "circle") return circleLabels[id] ?? id;
  if (scope === "routine") return routineLabels[id] ?? id;
  return id;
}

export function describeRecommendationSignal(value: string): string {
  const normalized = value.trim();
  if (!normalized) return "";
  const parts = normalized.split(":");
  if (!parts.length) return value;
  const kind = parts[0] === "fits" ? "fits you" : parts[0] === "dismissed" ? "was not for you" : null;
  if (!kind) return value;
  const [scope, id] = parts.length >= 3 ? [parts[1], parts.slice(2).join(":")] : ["mood", parts[1] ?? ""];
  const scopeLabel = scopeLabels[scope] ?? `${scope} recommendations`;
  const itemLabel = recommendationItemLabel(scope, id || "this item");
  return `You said ${scopeLabel} for "${itemLabel}" ${kind}.`;
}

export { interestLabels };

