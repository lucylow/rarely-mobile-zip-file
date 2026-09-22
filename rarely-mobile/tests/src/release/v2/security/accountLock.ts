export interface LockoutPolicy {
  maxFailures: number;
  windowMs: number;
  lockMs: number;
}

export const DEFAULT_LOCKOUT: LockoutPolicy = {
  maxFailures: 7,
  windowMs: 10 * 60_000,
  lockMs: 15 * 60_000,
};

export interface LockState {
  failures: number[];
  lockedUntil?: number;
}

export function recordFailure(state: LockState, policy = DEFAULT_LOCKOUT, now = Date.now()): LockState {
  const failures = state.failures.filter((timestamp) => now - timestamp <= policy.windowMs);
  failures.push(now);
  if (failures.length >= policy.maxFailures) return { failures, lockedUntil: now + policy.lockMs };
  return { failures };
}

export function isLocked(state: LockState, now = Date.now()): boolean {
  return !!state.lockedUntil && state.lockedUntil > now;
}
