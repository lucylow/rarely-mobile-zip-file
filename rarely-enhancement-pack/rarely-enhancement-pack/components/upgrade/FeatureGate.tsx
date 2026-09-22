import React from "react";
import type { ReactNode } from "react";
import type { FeatureFlagSnapshot } from "../../lib/ux/upgrade/types";

export function FeatureGate({
  flag,
  snapshot,
  children,
  fallback = null,
}: {
  flag: string;
  snapshot: FeatureFlagSnapshot;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return snapshot.flags[flag] ? <>{children}</> : <>{fallback}</>;
}
