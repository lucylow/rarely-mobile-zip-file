import { safeJsonParse, safeJsonStringify } from "./safeJson";

export type HealStatus = "missing" | "valid" | "repaired" | "quarantined";

export interface HealResult<T> {
  status: HealStatus;
  value?: T;
  backupKey?: string;
  error?: string;
}

export interface KeyValueStorage {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

export async function readAndHeal<T>(storage: KeyValueStorage, key: string, fallback: T, version: number): Promise<HealResult<T>> {
  const raw = await storage.get(key);
  if (raw == null) return { status: "missing", value: fallback };
  const parsed = safeJsonParse<{ version?: number; checksum?: string; value?: T }>(raw);
  if (!parsed.ok || !parsed.value) return quarantine(storage, key, raw, fallback);
  const value = parsed.value.value;
  if (value === undefined) return quarantine(storage, key, raw, fallback);
  const normalized = JSON.stringify({ version, value });
  const repaired = safeJsonStringify({ version, value, checksum: stableChecksum(normalized) });
  if (!repaired.ok || !repaired.value) return { status: "valid", value };
  if (parsed.value.version === version && parsed.value.checksum === stableChecksum(JSON.stringify({ version: parsed.value.version, value }))) {
    return { status: "valid", value };
  }
  await storage.set(key, repaired.value);
  return { status: "repaired", value };
}

function stableChecksum(value: string): string {
  let hash = 2166136261;
  for (const char of value) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}

async function quarantine<T>(storage: KeyValueStorage, key: string, raw: string, fallback: T): Promise<HealResult<T>> {
  const suffix = Date.now();
  const backupKey = `${key}.quarantine.${suffix}`;
  try {
    await storage.set(backupKey, raw);
    await storage.remove(key);
    return { status: "quarantined", value: fallback, backupKey, error: "Malformed local record was quarantined." };
  } catch (error) {
    return { status: "quarantined", value: fallback, error: error instanceof Error ? error.message : "quarantine-failed" };
  }
}
