export interface Backoff { attempt: number; baseMs: number; capMs: number; jitterRatio: number; }
export function backoffDelay(policy: Backoff, random = Math.random): number {
  const exp = Math.min(policy.capMs, policy.baseMs * 2 ** Math.max(0, policy.attempt));
  const jitter = exp * policy.jitterRatio * (random() * 2 - 1);
  return Math.max(0, Math.round(exp + jitter));
}
export function resetBackoff(policy: Backoff): Backoff { return { ...policy, attempt: 0 }; }
