export interface AppleIdentityClaims {
  sub: string;
  email?: string;
  emailVerified?: boolean;
  isPrivateEmail?: boolean;
  nonce?: string;
  issuer?: string;
  audience?: string;
  expiresAt?: number;
  issuedAt?: number;
}

export function validateAppleClaims(claims: AppleIdentityClaims, expectedAudience: string, nowSeconds = Math.floor(Date.now() / 1000)): string[] {
  const errors: string[] = [];
  if (!claims.sub) errors.push('subject-missing');
  if (claims.issuer && claims.issuer !== 'https://appleid.apple.com') errors.push('issuer-mismatch');
  if (claims.audience && claims.audience !== expectedAudience) errors.push('audience-mismatch');
  if (claims.expiresAt != null && claims.expiresAt <= nowSeconds) errors.push('token-expired');
  if (claims.issuedAt != null && claims.issuedAt > nowSeconds + 60) errors.push('issued-in-future');
  if (claims.email && claims.email.length > 320) errors.push('email-invalid');
  return errors;
}
