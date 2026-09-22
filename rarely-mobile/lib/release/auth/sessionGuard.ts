export type SessionState = "unknown" | "anonymous" | "authenticated" | "expired" | "revoked";

export interface SessionSnapshot { state: SessionState; userId?: string; checkedAt?: string; }

export function shouldRefreshSession(state: SessionSnapshot, now = Date.now(), maxAgeMs = 10 * 60_000): boolean {
  if (state.state !== "authenticated" || !state.checkedAt) return false;
  const checked = Date.parse(state.checkedAt);
  return Number.isFinite(checked) && now - checked > maxAgeMs;
}

export function canAccessProtectedRoute(state: SessionSnapshot): boolean { return state.state === "authenticated" && Boolean(state.userId); }
