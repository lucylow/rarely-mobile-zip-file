export type SyncOperation = "upsert" | "delete";
export type SyncState = "idle" | "queued" | "sending" | "conflict" | "synced" | "failed";

export interface SyncEvent<T = unknown> {
  id: string;
  entity: string;
  entityId: string;
  operation: SyncOperation;
  createdAt: string;
  version: number;
  payload?: T;
}

export interface SyncConflict<T = unknown> { entity: string; entityId: string; local: SyncEvent<T>; remote: SyncEvent<T>; reason: "newer-remote" | "same-version-different-value"; }
