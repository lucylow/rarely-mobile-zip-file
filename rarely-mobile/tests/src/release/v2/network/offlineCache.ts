export interface CacheRecord<T> {
  key: string;
  value: T;
  createdAt: number;
  updatedAt: number;
  staleAfterMs: number;
}

export function isStale<T>(record: CacheRecord<T>, now = Date.now()): boolean {
  return now - record.updatedAt > record.staleAfterMs;
}

export function canServeOffline<T>(record: CacheRecord<T>, now = Date.now(), hardExpiryMs = 7 * 24 * 60 * 60_000): boolean {
  return now - record.updatedAt <= hardExpiryMs;
}

export function revalidated<T>(record: CacheRecord<T>, value: T, now = Date.now()): CacheRecord<T> {
  return { ...record, value, updatedAt: now };
}
