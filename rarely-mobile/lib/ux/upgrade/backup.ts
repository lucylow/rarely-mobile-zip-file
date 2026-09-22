import { stableHash } from "./ids";
import type { ActivityEvent, BackupEnvelope, MemoryItem, RoutineState } from "./types";

export interface BackupPayload {
  activities: ActivityEvent[];
  memories: MemoryItem[];
  routines: RoutineState[];
  preferences: Record<string, unknown>;
}

export interface ImportResult {
  mode: "merge" | "replace";
  activitiesImported: number;
  memoriesImported: number;
  routinesImported: number;
  preferencesImported: number;
  warnings: string[];
}

export function createBackup(payload: BackupPayload, deviceId: string, appVersion?: string, exportedAt = new Date().toISOString()): BackupEnvelope {
  const unsigned = { format: "rarely-backup" as const, version: 1 as const, exportedAt, appVersion, deviceId, data: payload };
  return { ...unsigned, integrity: { algorithm: "sha256", checksum: checksumFor(unsigned) } };
}

export function serializeBackup(backup: BackupEnvelope): string {
  return JSON.stringify(backup, null, 2);
}

export function parseBackup(raw: string): BackupEnvelope {
  const value = JSON.parse(raw) as unknown;
  if (!isBackupEnvelope(value)) throw new Error("invalid_backup_format");
  const unsigned = { format: value.format, version: value.version, exportedAt: value.exportedAt, appVersion: value.appVersion, deviceId: value.deviceId, data: value.data };
  if (checksumFor(unsigned) !== value.integrity.checksum) throw new Error("backup_integrity_failed");
  return value;
}

export function importBackup(current: BackupPayload, incoming: BackupEnvelope, mode: "merge" | "replace"): { payload: BackupPayload; result: ImportResult } {
  if (mode === "replace") {
    return {
      payload: clonePayload(incoming.data),
      result: { mode, activitiesImported: incoming.data.activities.length, memoriesImported: incoming.data.memories.length, routinesImported: incoming.data.routines.length, preferencesImported: Object.keys(incoming.data.preferences).length, warnings: [] },
    };
  }
  const activities = new Map(current.activities.map((event) => [event.id, event]));
  for (const event of incoming.data.activities) activities.set(event.id, event);
  const memories = new Map(current.memories.map((memory) => [memory.id, memory]));
  for (const memory of incoming.data.memories) memories.set(memory.id, memory);
  const routines = new Map(current.routines.map((routine) => [routine.routineId, routine]));
  for (const routine of incoming.data.routines) routines.set(routine.routineId, routine);
  return {
    payload: {
      activities: [...activities.values()].sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
      memories: [...memories.values()],
      routines: [...routines.values()],
      preferences: { ...current.preferences, ...incoming.data.preferences },
    },
    result: { mode, activitiesImported: incoming.data.activities.length, memoriesImported: incoming.data.memories.length, routinesImported: incoming.data.routines.length, preferencesImported: Object.keys(incoming.data.preferences).length, warnings: [] },
  };
}

function checksumFor(value: unknown): string { return stableHash(JSON.stringify(value)); }
function clonePayload(payload: BackupPayload): BackupPayload { return JSON.parse(JSON.stringify(payload)) as BackupPayload; }

function isBackupEnvelope(value: unknown): value is BackupEnvelope {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return item.format === "rarely-backup" && item.version === 1 && typeof item.exportedAt === "string" && typeof item.deviceId === "string" && typeof item.data === "object" && item.data !== null && typeof item.integrity === "object" && item.integrity !== null;
}
