export type EventRecord = { id: string; name: string; createdAt: number; payload: Record<string, string|number|boolean|null>; priority: 'low'|'normal'|'high' };
export class EventBufferV2 {
  private items: EventRecord[] = [];
  constructor(private readonly max = 500) {}
  push(item: EventRecord): void { this.items.push(item); if (this.items.length > this.max) this.items = this.items.slice(-this.max); }
  drain(limit = 50): EventRecord[] { const out = this.items.slice(0, limit); this.items = this.items.slice(limit); return out; }
  size(): number { return this.items.length; }
  snapshot(): EventRecord[] { return [...this.items]; }
}
