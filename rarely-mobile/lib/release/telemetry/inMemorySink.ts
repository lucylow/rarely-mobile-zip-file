import type { TelemetryEvent } from "./events";

export class InMemoryTelemetrySink {
  readonly events: TelemetryEvent[] = [];
  write(event: TelemetryEvent): void { this.events.push(event); }
  clear(): void { this.events.length = 0; }
}
