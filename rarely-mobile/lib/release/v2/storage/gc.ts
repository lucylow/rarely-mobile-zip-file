export interface GarbageRecord { id: string; lastSeenAt: number; protected: boolean; }
export function collectGarbage(records: GarbageRecord[], now = Date.now(), staleMs = 30 * 24 * 60 * 60_000): GarbageRecord[] { return records.filter((record) => record.protected || now - record.lastSeenAt <= staleMs); }
