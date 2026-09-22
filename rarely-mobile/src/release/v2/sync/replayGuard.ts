export interface MutationEnvelope { id: string; type: string; createdAt: number; attempts: number; payload: unknown; }
export function canReplay(envelope: MutationEnvelope, now = Date.now(), maxAgeMs = 7 * 24 * 60 * 60_000): boolean { return envelope.attempts < 10 && now - envelope.createdAt <= maxAgeMs; }
