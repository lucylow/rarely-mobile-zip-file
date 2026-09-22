export type TransportRequest = { url: string; method: string; bodyBytes: number; auth: boolean; idempotencyKey?: string };
export function validateTransport(request: TransportRequest): string[] {
  const errors: string[] = [];
  if (!request.url.startsWith('https://')) errors.push('https-required');
  if (request.bodyBytes < 0) errors.push('negative-body-size');
  if (['POST','PUT','PATCH'].includes(request.method) && request.auth && !request.idempotencyKey) errors.push('idempotency-required');
  return errors;
}
export function safeHeaders(auth: boolean, idempotencyKey?: string): Record<string,string> { return { 'Accept': 'application/json', ...(auth ? { Authorization: 'Bearer <runtime>' } : {}), ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}) }; }
