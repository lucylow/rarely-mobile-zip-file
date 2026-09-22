import { redactObject } from "../privacy/redact";
import type { TelemetryEvent, TelemetryEventName } from "./events";

export interface TelemetrySink { write(event: TelemetryEvent): Promise<void> | void; }

export class TelemetryClient {
  constructor(private readonly sink: TelemetrySink, private readonly sessionId: string, private enabled = false) {}
  setEnabled(value: boolean): void { this.enabled = value; }
  async track(name: TelemetryEventName, properties?: Record<string, string | number | boolean | null>): Promise<void> {
    if (!this.enabled) return;
    const redacted = redactObject(properties) as Record<string, string | number | boolean | null> | undefined;
    await this.sink.write({ name, timestamp: new Date().toISOString(), sessionId: this.sessionId, properties: redacted });
  }
}
