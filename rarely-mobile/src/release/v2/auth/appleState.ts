import { randomBytes, createHash } from 'node:crypto';

export interface AppleLoginState {
  nonce: string;
  state: string;
  createdAt: number;
  expiresAt: number;
}

function base64url(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString('base64url');
}

export function createAppleLoginState(now = Date.now(), ttlMs = 5 * 60_000): AppleLoginState {
  const nonce = base64url(randomBytes(24));
  const state = base64url(randomBytes(24));
  return { nonce, state, createdAt: now, expiresAt: now + ttlMs };
}

export function isAppleStateValid(input: AppleLoginState, now = Date.now()): boolean {
  return now >= input.createdAt && now <= input.expiresAt && input.nonce.length >= 16 && input.state.length >= 16;
}

export function hashedNonce(rawNonce: string): string {
  return createHash('sha256').update(rawNonce).digest('hex');
}
