import { createSessionId } from "./ids";

export interface SecuritySession {
  id: string;
  createdAt: string;
  lastSeenAt: string;
  deviceLabel?: string;
  authenticated: boolean;
}

export interface SessionSecurityPolicy {
  idleTimeoutMinutes: number;
  maxLifetimeDays: number;
  reauthenticateForSensitiveActions: boolean;
}

export const DEFAULT_SECURITY_POLICY: SessionSecurityPolicy = {
  idleTimeoutMinutes: 30,
  maxLifetimeDays: 30,
  reauthenticateForSensitiveActions: true,
};

export class SessionSecurity {
  private session: SecuritySession | null = null;

  start(authenticated: boolean, now = new Date(), deviceLabel?: string): SecuritySession {
    const stamp = now.toISOString();
    this.session = { id: createSessionId(), createdAt: stamp, lastSeenAt: stamp, deviceLabel, authenticated };
    return this.get()!;
  }

  touch(now = new Date()): void {
    if (this.session) this.session.lastSeenAt = now.toISOString();
  }

  invalidate(): void { this.session = null; }

  isUsable(policy: SessionSecurityPolicy = DEFAULT_SECURITY_POLICY, now = new Date()): boolean {
    if (!this.session) return false;
    const lastSeenAge = now.getTime() - Date.parse(this.session.lastSeenAt);
    const lifetime = now.getTime() - Date.parse(this.session.createdAt);
    return lastSeenAge <= policy.idleTimeoutMinutes * 60_000 && lifetime <= policy.maxLifetimeDays * 86_400_000;
  }

  needsReauthForSensitiveAction(policy: SessionSecurityPolicy = DEFAULT_SECURITY_POLICY): boolean {
    return Boolean(policy.reauthenticateForSensitiveActions && this.session && !this.session.authenticated);
  }

  get(): SecuritySession | null { return this.session ? { ...this.session } : null; }
}
