export interface RouteRequirement {
  route: string;
  featureFlag?: string;
  requiresAuth?: boolean;
  allowWhenOffline?: boolean;
}

export interface RouteDecision {
  allowed: boolean;
  reason: "ok" | "feature_disabled" | "auth_required" | "offline" | "unknown";
}

export function canEnterRoute(requirement: RouteRequirement, state: { authenticated: boolean; online: boolean; flags: Record<string, boolean> }): RouteDecision {
  if (requirement.featureFlag && !state.flags[requirement.featureFlag]) return { allowed: false, reason: "feature_disabled" };
  if (requirement.requiresAuth && !state.authenticated) return { allowed: false, reason: "auth_required" };
  if (!state.online && requirement.allowWhenOffline === false) return { allowed: false, reason: "offline" };
  return { allowed: true, reason: "ok" };
}

export const UPGRADE_ROUTES: RouteRequirement[] = [
  { route: "/upgrade-hub", featureFlag: "upgrade_hub", allowWhenOffline: true },
  { route: "/memories", featureFlag: "personal_memory", allowWhenOffline: true },
  { route: "/insights", featureFlag: "smart_insights", allowWhenOffline: true },
  { route: "/sync-center", featureFlag: "selective_sync", requiresAuth: true, allowWhenOffline: true },
];
