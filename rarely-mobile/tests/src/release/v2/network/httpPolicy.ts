export interface HttpResponse<T> {
  status: number;
  data?: T;
  headers: Record<string, string | undefined>;
}

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export function retryAfterMs(headers: Record<string, string | undefined>, fallback = 1000): number {
  const raw = headers['retry-after'];
  if (!raw) return fallback;
  const seconds = Number(raw);
  if (Number.isFinite(seconds)) return Math.min(60_000, Math.max(250, seconds * 1000));
  const date = Date.parse(raw);
  if (Number.isFinite(date)) return Math.min(60_000, Math.max(250, date - Date.now()));
  return fallback;
}

export function classifyHttpFailure(status: number): 'client' | 'auth' | 'rate-limit' | 'server' | 'network' {
  if (status === 401 || status === 403) return 'auth';
  if (status === 429) return 'rate-limit';
  if (status >= 400 && status < 500) return 'client';
  if (status >= 500) return 'server';
  return 'network';
}
