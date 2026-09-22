import type { SyncConflict, SyncEvent } from "./types";

export function mergeEvents<T>(local: SyncEvent<T>, remote: SyncEvent<T>): SyncEvent<T> | SyncConflict<T> {
  if (remote.version > local.version) return remote;
  if (local.version > remote.version) return local;
  if (JSON.stringify(local.payload) === JSON.stringify(remote.payload) && local.operation === remote.operation) return local;
  return { entity: local.entity, entityId: local.entityId, local, remote, reason: "same-version-different-value" };
}

export function mergeMany<T>(local: SyncEvent<T>[], remote: SyncEvent<T>[]): { merged: SyncEvent<T>[]; conflicts: SyncConflict<T>[] } {
  const byKey = new Map(local.map((event) => [`${event.entity}:${event.entityId}`, event]));
  const conflicts: SyncConflict<T>[] = [];
  for (const event of remote) {
    const key = `${event.entity}:${event.entityId}`;
    const current = byKey.get(key);
    if (!current) byKey.set(key, event);
    else { const result = mergeEvents(current, event); if ("reason" in result) conflicts.push(result); else byKey.set(key, result); }
  }
  return { merged: [...byKey.values()], conflicts };
}
