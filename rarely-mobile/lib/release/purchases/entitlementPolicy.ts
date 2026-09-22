import type { EntitlementSnapshot } from "./types";

export type PaidFeature =
  | "advanced-ai"
  | "cloud-sync"
  | "premium-routines"
  | "scrapbook-filters"
  | "creative-exports";

const REQUIREMENTS: Record<PaidFeature, boolean> = {
  "advanced-ai": true,
  "cloud-sync": true,
  "premium-routines": true,
  "scrapbook-filters": true,
  "creative-exports": true,
};

export function canAccess(feature: PaidFeature, entitlement?: EntitlementSnapshot): boolean {
  if (!REQUIREMENTS[feature]) return true;
  return entitlement?.id === "rarely_plus" && entitlement.active === true;
}

export function explainAccess(feature: PaidFeature, entitlement?: EntitlementSnapshot): string {
  if (canAccess(feature, entitlement)) return "Included with your membership.";
  return feature === "cloud-sync" ? "Upgrade to keep selected moments available across devices." : "Available with RARELY Plus.";
}
