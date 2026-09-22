export function shouldRefreshOnForeground(lastRefreshAt: number | undefined, now = Date.now(), maxAgeMs = 5 * 60_000): boolean { return lastRefreshAt == null || now - lastRefreshAt >= maxAgeMs; }
