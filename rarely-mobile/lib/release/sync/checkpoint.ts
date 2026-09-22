export interface SyncCheckpoint { cursor: string; updatedAt: string; eventCount: number; }
export function compareCursor(a: string | undefined, b: string | undefined): number { return String(a ?? "").localeCompare(String(b ?? "")); }
export function newerCheckpoint(current: SyncCheckpoint | undefined, incoming: SyncCheckpoint): SyncCheckpoint { return !current || compareCursor(incoming.cursor, current.cursor) > 0 ? incoming : current; }
