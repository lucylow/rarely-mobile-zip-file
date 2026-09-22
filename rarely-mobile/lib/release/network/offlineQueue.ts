export interface QueueItem<T> {
  id: string;
  createdAt: number;
  attempts: number;
  payload: T;
  nextAttemptAt: number;
}

export class OfflineQueue<T> {
  private readonly items: QueueItem<T>[] = [];

  enqueue(id: string, payload: T, now = Date.now()): void {
    if (this.items.some((item) => item.id === id)) return;
    this.items.push({ id, payload, createdAt: now, attempts: 0, nextAttemptAt: now });
  }

  due(now = Date.now()): QueueItem<T>[] {
    return this.items.filter((item) => item.nextAttemptAt <= now).sort((a, b) => a.createdAt - b.createdAt);
  }

  succeed(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) this.items.splice(index, 1);
  }

  fail(id: string, now = Date.now(), delayMs = 2_000): void {
    const item = this.items.find((entry) => entry.id === id);
    if (!item) return;
    item.attempts += 1;
    item.nextAttemptAt = now + Math.min(60_000, delayMs * 2 ** Math.max(0, item.attempts - 1));
  }

  snapshot(): QueueItem<T>[] {
    return this.items.map((item) => ({ ...item }));
  }
}
