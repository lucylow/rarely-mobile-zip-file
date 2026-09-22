import { createTelemetryId } from "./ids";
import type { TelemetryEvent } from "./types";

export interface TelemetrySink { write(events: TelemetryEvent[]): Promise<void>; }

export class MemoryTelemetrySink implements TelemetrySink {
  readonly events: TelemetryEvent[] = [];
  async write(events: TelemetryEvent[]): Promise<void> { this.events.push(...events); }
}

export interface TelemetryPolicy {
  enabled: boolean;
  allowIdentifiers: boolean;
  maxQueueSize: number;
}

export class TelemetryBuffer {
  private queue: TelemetryEvent[] = [];
  constructor(private readonly policy: TelemetryPolicy, private readonly sink: TelemetrySink) {}

  track(name: string, properties: Record<string, string | number | boolean> = {}): void {
    if (!this.policy.enabled) return;
    const cleaned = this.policy.allowIdentifiers ? properties : scrubProperties(properties);
    this.queue.push({ name: `${name}:${createTelemetryId(name)}`, occurredAt: new Date().toISOString(), properties: cleaned });
    if (this.queue.length > this.policy.maxQueueSize) this.queue = this.queue.slice(-this.policy.maxQueueSize);
  }

  async flush(): Promise<void> {
    if (!this.policy.enabled || !this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);
    await this.sink.write(batch);
  }

  size(): number { return this.queue.length; }
  peek(): TelemetryEvent[] { return [...this.queue]; }
}

function scrubProperties(properties: Record<string, string | number | boolean>): Record<string, string | number | boolean> {
  const blocked = new Set(["email", "name", "username", "phone", "id", "token"]);
  return Object.fromEntries(Object.entries(properties).filter(([key]) => !blocked.has(key)));
}
