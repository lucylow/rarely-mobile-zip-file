export type AiMode = 'spark' | 'reflect' | 'play';

export interface AiInputPolicy {
  maxChars: number;
  allowJournalContext: boolean;
  requireConsent: boolean;
  secretDetection: boolean;
}

export const AI_POLICIES: Record<AiMode, AiInputPolicy> = {
  spark: { maxChars: 2_000, allowJournalContext: false, requireConsent: true, secretDetection: true },
  reflect: { maxChars: 3_000, allowJournalContext: false, requireConsent: true, secretDetection: true },
  play: { maxChars: 4_000, allowJournalContext: false, requireConsent: true, secretDetection: true },
};

export function validateAiInput(mode: AiMode, input: string, consent: boolean): string[] {
  const policy = AI_POLICIES[mode];
  const issues: string[] = [];
  if (policy.requireConsent && !consent) issues.push('consent-required');
  if (!input.trim()) issues.push('empty-input');
  if (input.length > policy.maxChars) issues.push('input-too-long');
  if (policy.secretDetection && /(password|api[_ -]?key|secret|private key|bearer\s+)/i.test(input)) issues.push('secret-like-content');
  return issues;
}
