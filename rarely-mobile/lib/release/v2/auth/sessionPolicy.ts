export interface SessionSnapshot {
  userId: string;
  accessToken: string;
  refreshToken?: string;
  issuedAt: number;
  expiresAt: number;
  provider: 'apple' | 'email' | 'mock';
}

export type SessionDecision =
  | { kind: 'valid'; session: SessionSnapshot }
  | { kind: 'refresh'; session: SessionSnapshot }
  | { kind: 'signed-out'; reason: string };

export function inspectSession(session: SessionSnapshot | undefined, now = Date.now(), refreshWindowMs = 2 * 60_000): SessionDecision {
  if (!session) return { kind: 'signed-out', reason: 'missing' };
  if (!session.userId || !session.accessToken) return { kind: 'signed-out', reason: 'malformed' };
  if (now >= session.expiresAt) return { kind: 'signed-out', reason: 'expired' };
  if (session.expiresAt - now <= refreshWindowMs && session.refreshToken) return { kind: 'refresh', session };
  return { kind: 'valid', session };
}

export function assertRefreshIsBoundToUser(session: SessionSnapshot, userId: string): void {
  if (session.userId !== userId) throw new Error('Refresh token is bound to another user.');
}
