export interface QueueItem<T> { id: string; value: T; attempts: number; createdAt: number; }
export class BoundedQueue<T> {
  private readonly items: QueueItem<T>[] = [];
  constructor(private readonly maxItems = 1000) {}
  push(item: QueueItem<T>): boolean { if (this.items.length >= this.maxItems) return false; this.items.push(item); return true; }
  shift(): QueueItem<T> | undefined { return this.items.shift(); }
  peek(): QueueItem<T> | undefined { return this.items[0]; }
  size(): number { return this.items.length; }
  clear(): void { this.items.length = 0; }
  snapshot(): QueueItem<T>[] { return this.items.map((item) => ({ ...item })); }
}
