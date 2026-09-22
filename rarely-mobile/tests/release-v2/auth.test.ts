import { describe, expect, it } from 'vitest';
import { createAppleLoginState, isAppleStateValid } from '../../src/release/v2/auth/appleState';
import { inspectSession } from '../../src/release/v2/auth/sessionPolicy';

describe('auth hardening', () => {
  it('accepts a fresh apple state', () => expect(isAppleStateValid(createAppleLoginState(1000), 2000)).toBe(true));
  it('rejects an expired session', () => expect(inspectSession({ userId: 'u1', accessToken: 'a', issuedAt: 0, expiresAt: 10, provider: 'apple' }, 11).kind).toBe('signed-out'));
});
