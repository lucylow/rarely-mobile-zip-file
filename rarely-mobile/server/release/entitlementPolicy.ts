export interface ServerEntitlement { userId: string; entitlementId: string; active: boolean; expiresAt?: number | null; }

export function entitlementAllowsFeature(entitlement: ServerEntitlement | undefined, requiredEntitlement = "rarely_plus", now = Date.now()): boolean {
  if (!entitlement) return false;
  if (entitlement.entitlementId !== requiredEntitlement || !entitlement.active) return false;
  if (entitlement.expiresAt !== undefined && entitlement.expiresAt !== null && entitlement.expiresAt <= now) return false;
  return true;
}

export function activeEntitlementIds(rows: ServerEntitlement[], now = Date.now()): string[] {
  return rows.filter((row) => entitlementAllowsFeature(row, row.entitlementId, now)).map((row) => row.entitlementId);
}
