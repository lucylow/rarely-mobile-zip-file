export class MemoryStorage {
  private readonly values = new Map<string, string>();
  async get(key: string): Promise<string | null> { return this.values.get(key) ?? null; }
  async set(key: string, value: string): Promise<void> { this.values.set(key, value); }
  async remove(key: string): Promise<void> { this.values.delete(key); }
  clear(): void { this.values.clear(); }
  dump(): Record<string, string> { return Object.fromEntries(this.values.entries()); }
}
