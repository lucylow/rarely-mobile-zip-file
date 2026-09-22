import { createHmac } from 'node:crypto';

export function signPayload(secret: string, body: string, timestamp: number): string {
  return createHmac('sha256', secret).update(`${timestamp}.${body}`).digest('hex');
}

export function verifyPayload(secret: string, body: string, timestamp: number, signature: string, toleranceMs = 5 * 60_000): boolean {
  if (Math.abs(Date.now() - timestamp) > toleranceMs) return false;
  const expected = signPayload(secret, body, timestamp);
  if (expected.length !== signature.length) return false;
  let mismatch = 0;
  for (let i = 0; i < expected.length; i += 1) mismatch |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return mismatch === 0;
}
