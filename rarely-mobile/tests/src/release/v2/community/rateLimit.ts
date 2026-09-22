export interface RateLimitWindow {
  limit: number;
  windowMs: number;
}

export interface RateLimitState {
  timestamps: number[];
}

export function allowAction(state: RateLimitState, policy: RateLimitWindow, now = Date.now()): { allowed: boolean; next?: number; state: RateLimitState } {
  const timestamps = state.timestamps.filter((timestamp) => now - timestamp < policy.windowMs);
  if (timestamps.length >= policy.limit) return { allowed: false, next: timestamps[0] + policy.windowMs, state: { timestamps } };
  timestamps.push(now);
  return { allowed: true, state: { timestamps } };
}
