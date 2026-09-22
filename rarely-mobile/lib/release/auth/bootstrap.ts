import type { SessionSnapshot } from "./sessionGuard";

export interface AuthGateway {
  getCurrentUser(): Promise<{ id: string } | null>;
  clearLocalSession(): Promise<void>;
}

export async function bootstrapSession(gateway: AuthGateway): Promise<SessionSnapshot> {
  try {
    const user = await gateway.getCurrentUser();
    return user
      ? { state: "authenticated", userId: user.id, checkedAt: new Date().toISOString() }
      : { state: "anonymous", checkedAt: new Date().toISOString() };
  } catch {
    await gateway.clearLocalSession();
    return { state: "expired", checkedAt: new Date().toISOString() };
  }
}
