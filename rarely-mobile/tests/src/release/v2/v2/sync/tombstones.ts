export interface Tombstone { id: string; deletedAt: number; source: 'local' | 'server'; }
export function shouldKeepTombstone(tombstone: Tombstone, now = Date.now(), retentionMs = 30 * 24 * 60 * 60_000): boolean { return now - tombstone.deletedAt <= retentionMs; }
export function latestTombstone(a: Tombstone, b: Tombstone): Tombstone { return a.deletedAt >= b.deletedAt ? a : b; }
