export type ReviewScenario = 'new-user' | 'member' | 'offline' | 'purchase' | 'delete-account' | 'ai-consent';
export type ReviewCredential = { email: string; mode: 'sandbox' | 'internal'; expiresAt: number };
export function buildReviewSteps(scenario: ReviewScenario): string[] {
  const common = ['launch', 'complete-onboarding', 'mood-check-in', 'open-rare-moment', 'return-home'];
  const extra: Record<ReviewScenario, string[]> = {
    'new-user': ['create-account', 'verify-preferences'], 'member': ['open-membership', 'view-entitlements'],
    offline: ['disable-network', 'open-cached-journal', 'create-local-draft', 'reconnect'],
    purchase: ['open-paywall', 'select-plan', 'complete-sandbox-purchase', 'restore-purchases'],
    'delete-account': ['open-settings', 'open-account-controls', 'request-deletion', 'confirm-deletion'],
    'ai-consent': ['open-rare-ai', 'read-consent', 'decline-consent', 'retry-without-ai'],
  };
  return [...common, ...extra[scenario]];
}
export function validateCredential(credential: ReviewCredential, now: number = Date.now()): string[] {
  const errors: string[] = [];
  if (!credential.email.includes('@')) errors.push('invalid-email');
  if (credential.expiresAt <= now) errors.push('expired');
  return errors;
}
