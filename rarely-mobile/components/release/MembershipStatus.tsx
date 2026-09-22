import React from "react";
import { Text, View } from "react-native";
import type { EntitlementSnapshot } from "../../lib/release/purchases/types";

export function MembershipStatus({ entitlement }: { entitlement?: EntitlementSnapshot }) {
  const active = entitlement?.active === true;
  return <View accessibilityRole="summary" style={{ padding: 16, borderRadius: 18, backgroundColor: active ? "#D8E1D5" : "#F3E4DD", gap: 5 }}>
    <Text style={{ fontSize: 18, fontWeight: "800" }}>{active ? "RARELY Plus is active" : "RARELY Free"}</Text>
    <Text>{active ? (entitlement?.willRenew ? "Your membership is set to renew." : "Your membership is active but may end at the current period.") : "Core RARELY experiences remain available without membership."}</Text>
    {entitlement?.expirationDate ? <Text style={{ color: "#7E6F7D" }}>Access through {new Date(entitlement.expirationDate).toLocaleDateString()}.</Text> : null}
  </View>;
}
