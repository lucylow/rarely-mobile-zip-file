import type { SyncEvent } from "./types";

export class SyncOutbox<T = unknown> {
  private events: SyncEvent<T>[] = [];
  enqueue(event: SyncEvent<T>): void { if (!this.events.some((item) => item.id === event.id)) this.events.push(event); }
  next(limit = 25): SyncEvent<T>[] { return this.events.slice(0, Math.max(1, Math.min(limit, 100))).map((event) => ({ ...event })); }
  acknowledge(ids: string[]): void { const keep = new Set(ids); this.events = this.events.filter((event) => !keep.has(event.id)); }
  size(): number { return this.events.length; }
  snapshot(): SyncEvent<T>[] { return this.events.map((event) => ({ ...event })); }
}
