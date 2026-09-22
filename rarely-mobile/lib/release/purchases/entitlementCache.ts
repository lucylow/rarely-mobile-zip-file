import type { EntitlementSnapshot } from "./types";

export interface EntitlementCacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

const KEY = "rarely.release.entitlement";

export async function saveEntitlement(store: EntitlementCacheStore, snapshot: EntitlementSnapshot): Promise<void> {
  await store.set(KEY, JSON.stringify(snapshot));
}

export async function readEntitlement(store: EntitlementCacheStore): Promise<EntitlementSnapshot | undefined> {
  const raw = await store.get(KEY);
  if (!raw) return undefined;
  try {
    const value = JSON.parse(raw) as EntitlementSnapshot;
    if (typeof value?.id !== "string" || typeof value.active !== "boolean") return undefined;
    return value;
  } catch {
    await store.remove(KEY);
    return undefined;
  }
}

export async function clearEntitlement(store: EntitlementCacheStore): Promise<void> {
  await store.remove(KEY);
}
