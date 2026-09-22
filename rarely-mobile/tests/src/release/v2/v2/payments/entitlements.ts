export interface Entitlement {
  key: 'premium';
  active: boolean;
  productId?: string;
  expiresAt?: number;
  source: 'storekit' | 'server' | 'cache' | 'mock';
  updatedAt: number;
}

export interface EntitlementSnapshot {
  premium: Entitlement;
  fetchedAt: number;
}

export function hasPremiumAccess(snapshot: EntitlementSnapshot | undefined, now = Date.now()): boolean {
  const entitlement = snapshot?.premium;
  if (!entitlement || !entitlement.active) return false;
  return entitlement.expiresAt == null || entitlement.expiresAt > now;
}

export function safeMergeEntitlement(local: EntitlementSnapshot | undefined, incoming: EntitlementSnapshot): EntitlementSnapshot {
  if (!local) return incoming;
  if (incoming.fetchedAt < local.fetchedAt) return local;
  return incoming;
}
