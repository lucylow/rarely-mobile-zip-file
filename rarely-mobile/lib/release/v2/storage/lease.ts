export interface StorageLease { owner: string; expiresAt: number; }
export function leaseValid(lease: StorageLease | undefined, owner: string, now = Date.now()): boolean { return !!lease && lease.owner === owner && lease.expiresAt > now; }
export function renewLease(owner: string, ttlMs = 15_000, now = Date.now()): StorageLease { return { owner, expiresAt: now + ttlMs }; }
