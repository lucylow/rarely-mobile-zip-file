import type { TelemetryEvent } from "./events";

export class SafeConsoleSink {
  write(event: TelemetryEvent): void {
    if (typeof console !== "undefined" && typeof console.debug === "function") console.debug("[RARELY]", event.name, event.properties ?? {});
  }
}
