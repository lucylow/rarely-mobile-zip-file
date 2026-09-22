export interface SoftDeleteRecord { deletedAt?: number; purgeAfter?: number; }
export function markDeleted<T extends SoftDeleteRecord>(value: T, now = Date.now(), purgeAfterMs = 7 * 24 * 60 * 60_000): T { return { ...value, deletedAt: now, purgeAfter: now + purgeAfterMs }; }
export function dueForPurge(value: SoftDeleteRecord, now = Date.now()): boolean { return !!value.purgeAfter && value.purgeAfter <= now; }
