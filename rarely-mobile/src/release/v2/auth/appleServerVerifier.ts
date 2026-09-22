import { createHash } from 'node:crypto';

export interface AppleKey { kid: string; kty: string; alg: string; use: string; n: string; e: string; }
export interface AppleKeySet { keys: AppleKey[]; }
export interface TokenVerifier { verify(token: string, key: AppleKey, audience: string): Promise<Record<string, unknown>>; }

export function appleKeyForKid(set: AppleKeySet, kid: string): AppleKey | undefined {
  return set.keys.find((key) => key.kid === kid && key.kty === 'RSA' && key.alg === 'RS256');
}

export function hashAppleSubject(subject: string): string {
  return createHash('sha256').update(`apple:${subject}`).digest('hex');
}

export async function verifyAppleToken(input: { token: string; kid: string; keys: AppleKeySet; audience: string; verifier: TokenVerifier }): Promise<Record<string, unknown>> {
  const key = appleKeyForKid(input.keys, input.kid);
  if (!key) throw new Error('apple-signing-key-not-found');
  const claims = await input.verifier.verify(input.token, key, input.audience);
  const issuer = claims.iss;
  if (issuer !== 'https://appleid.apple.com') throw new Error('apple-issuer-invalid');
  if (claims.aud !== input.audience) throw new Error('apple-audience-invalid');
  return claims;
}
