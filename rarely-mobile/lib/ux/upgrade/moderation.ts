export type ModerationDecision = "allow" | "review" | "block";

export interface ModerationResult {
  decision: ModerationDecision;
  score: number;
  reasons: string[];
  normalized: string;
  suggestions: string[];
}

const BLOCK_PATTERNS = [
  /\b(?:kill|murder|hurt|harm)\s+(?:you|them|him|her)\b/i,
  /\b(?:dox|doxx)\b/i,
  /\b(?:password|api[_ -]?key|token)\s*[:=]/i,
];

const REVIEW_PATTERNS = [
  /\b(?:idiot|stupid|loser)\b/i,
  /\b(?:hate|hateful)\b/i,
  /\b(?:threat|threaten)\b/i,
];

export function moderateCommunityPost(input: string, context: { recentFlags?: number } = {}): ModerationResult {
  const normalized = normalizePost(input);
  const reasons: string[] = [];
  let score = 0;
  for (const pattern of BLOCK_PATTERNS) if (pattern.test(normalized)) { score += 0.8; reasons.push("Contains a high-risk phrase that should not be posted automatically."); }
  for (const pattern of REVIEW_PATTERNS) if (pattern.test(normalized)) { score += 0.25; reasons.push("Contains language that may need a human-quality check."); }
  if (normalized.length > 1200) { score += 0.15; reasons.push("Post is longer than the community pre-flight limit."); }
  if ((context.recentFlags ?? 0) > 2) { score += 0.1; reasons.push("Recent community reports raise the review threshold."); }
  const decision = score >= 0.7 ? "block" : score >= 0.25 ? "review" : "allow";
  return { decision, score: Math.min(1, score), reasons, normalized, suggestions: suggestionsFor(decision, normalized) };
}

export function normalizePost(input: string): string {
  return input.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
}

function suggestionsFor(decision: ModerationDecision, normalized: string): string[] {
  if (decision === "allow") return [];
  if (decision === "block") return [
    "Remove private credentials or identifying information.",
    "Rewrite threats or instructions as a personal feeling or question.",
  ];
  if (normalized.length > 1200) return ["Trim the post to the clearest thought.", "Move extra context into a private scrapbook entry."];
  return ["Try describing your own experience instead of labeling another person.", "Keep the room curious and specific."];
}
