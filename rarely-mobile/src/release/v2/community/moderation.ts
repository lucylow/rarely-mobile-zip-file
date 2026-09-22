export type ModerationDecision = 'allow' | 'review' | 'block';

const HIGH_RISK = [/self\s*harm/i, /how\s+to\s+make\s+a\s+bomb/i, /credit\s*card\s+number/i];
const HARASSMENT = [/kill\s+yourself/i, /you\s+are\s+worthless/i];

export interface ModerationResult {
  decision: ModerationDecision;
  reasons: string[];
  normalized: string;
}

export function moderatePost(input: string): ModerationResult {
  const normalized = input.trim().replace(/\s+/g, ' ');
  const reasons: string[] = [];
  if (!normalized) return { decision: 'block', reasons: ['empty'], normalized };
  if (normalized.length > 4_000) reasons.push('too-long');
  if (HIGH_RISK.some((pattern) => pattern.test(normalized))) reasons.push('high-risk-content');
  if (HARASSMENT.some((pattern) => pattern.test(normalized))) reasons.push('targeted-harassment');
  if (reasons.includes('high-risk-content')) return { decision: 'block', reasons, normalized };
  if (reasons.length) return { decision: 'review', reasons, normalized };
  return { decision: 'allow', reasons, normalized };
}
