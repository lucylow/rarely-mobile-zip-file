import React, { useEffect, useState } from "react";
import { Linking, ScrollView, Text } from "react-native";
import { ActionButton, DegradedBanner, MembershipStatus } from "../../components/release";
import { createReleasePurchaseGateway } from "../../lib/release/purchases/gatewayFactory";
import { PurchaseCoordinator } from "../../lib/release/purchases/purchaseCoordinator";

const coordinator = new PurchaseCoordinator(createReleasePurchaseGateway());
const TERMS_URL = process.env.EXPO_PUBLIC_TERMS_URL ?? "";
const PRIVACY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "";

export default function MembershipSettingsScreen() {
  const [session, setSession] = useState(coordinator.snapshot);
  const [busy, setBusy] = useState(false);
  useEffect(() => { coordinator.loadOfferings().then(setSession); }, []);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
    <Text style={{ fontSize: 30, fontWeight: "900" }}>Membership</Text>
    <MembershipStatus entitlement={session.entitlement} />
    {session.errorCode ? <DegradedBanner message={`Membership check: ${session.errorCode}`} /> : null}
    <ActionButton title="Restore Purchases" busy={busy} onPress={async () => { setBusy(true); setSession(await coordinator.restore()); setBusy(false); }} />
    <ActionButton title="Refresh membership" busy={busy} onPress={async () => { setBusy(true); setSession(await coordinator.refresh()); setBusy(false); }} />
    {TERMS_URL ? <ActionButton title="Terms" onPress={() => Linking.openURL(TERMS_URL)} /> : null}
    {PRIVACY_URL ? <ActionButton title="Privacy Policy" onPress={() => Linking.openURL(PRIVACY_URL)} /> : null}
  </ScrollView>;
}
