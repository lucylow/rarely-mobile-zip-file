export interface Ack { mutationId: string; accepted: boolean; serverVersion?: number; reason?: string; }
export function applyAck<T extends { id: string; version: number }>(record: T, ack: Ack): T { if (record.id !== ack.mutationId || !ack.accepted || ack.serverVersion == null) return record; return { ...record, version: Math.max(record.version, ack.serverVersion) }; }
