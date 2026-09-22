export type Session = { accessToken: string; refreshToken?: string; expiresAt: number; userId: string };
export function needsRefresh(session: Session, now = Date.now(), windowMs = 5 * 60_000): boolean { return session.expiresAt - now <= windowMs; }
export function shouldLogout(error: unknown): boolean { return error instanceof Error && /invalid.?refresh|revoked|unauthorized/i.test(error.message); }
export function sessionSummary(session: Session): { userId: string; expiresAt: number; hasRefreshToken: boolean } { return { userId: session.userId, expiresAt: session.expiresAt, hasRefreshToken: Boolean(session.refreshToken) }; }
