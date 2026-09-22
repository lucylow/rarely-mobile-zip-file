export interface CacheRecord<T> { value: T; savedAt: number; }

export class MemoryCacheFallback<T> {
  private current?: CacheRecord<T>;
  save(value: T, now = Date.now()): void { this.current = { value, savedAt: now }; }
  read(): CacheRecord<T> | undefined { return this.current ? { ...this.current } : undefined; }
  readWithin(maxAgeMs: number, now = Date.now()): T | undefined {
    if (!this.current) return undefined;
    return now - this.current.savedAt <= maxAgeMs ? this.current.value : undefined;
  }
  clear(): void { this.current = undefined; }
}
