import type { ActivityEvent, MemoryItem, RoutineState } from "./types";
import { createBackup, serializeBackup } from "./backup";

export interface ExportOptions {
  includePrivate: boolean;
  includeEvents: boolean;
  includeMemories: boolean;
  includeRoutines: boolean;
}

export interface ExportSource {
  deviceId: string;
  appVersion?: string;
  events: ActivityEvent[];
  memories: MemoryItem[];
  routines: RoutineState[];
  preferences: Record<string, unknown>;
}

export function buildExport(source: ExportSource, options: ExportOptions): string {
  const events = options.includeEvents ? source.events.filter((event) => options.includePrivate || event.privacy !== "private-journal") : [];
  return serializeBackup(createBackup({
    activities: events,
    memories: options.includeMemories ? source.memories : [],
    routines: options.includeRoutines ? source.routines : [],
    preferences: source.preferences,
  }, source.deviceId, source.appVersion));
}
