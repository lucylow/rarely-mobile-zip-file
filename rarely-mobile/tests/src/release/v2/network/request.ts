import { createHash } from 'node:crypto';

export interface RequestEnvelope {
  requestId: string;
  method: string;
  path: string;
  timeoutMs: number;
  idempotencyKey?: string;
  bodyHash?: string;
}

export function requestId(seed: string): string {
  return createHash('sha256').update(`${seed}:${Date.now()}:${Math.random()}`).digest('hex').slice(0, 24);
}

export function makeEnvelope(input: Omit<RequestEnvelope, 'requestId'> & { seed: string }): RequestEnvelope {
  return {
    requestId: requestId(input.seed),
    method: input.method.toUpperCase(),
    path: input.path,
    timeoutMs: Math.max(1000, Math.min(input.timeoutMs, 30_000)),
    idempotencyKey: input.idempotencyKey,
    bodyHash: input.bodyHash,
  };
}
