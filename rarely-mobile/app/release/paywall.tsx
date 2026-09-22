import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { ActionButton, DegradedBanner, EmptyState, LoadingState, PriceRow } from "../../components/release";
import { PurchaseCoordinator } from "../../lib/release/purchases/purchaseCoordinator";
import { createReleasePurchaseGateway } from "../../lib/release/purchases/gatewayFactory";

const gateway = createReleasePurchaseGateway();
const coordinator = new PurchaseCoordinator(gateway);

export default function ReleasePaywallScreen() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState<string>();
  const [session, setSession] = useState(coordinator.snapshot);
  useEffect(() => { coordinator.loadOfferings().then(setSession).finally(() => setLoading(false)); }, []);
  const packages = session.offering?.availablePackages ?? [];
  const chosen = packages[selected];
  const headline = useMemo(() => "More room to make things your own.", []);
  if (loading) return <LoadingState label="Loading membership options…" />;
  if (!session.offering) return <EmptyState title="Membership is unavailable" detail="You can keep using free RARELY features while the store connection recovers." />;
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 18 }}>
    <Text style={{ fontSize: 30, fontWeight: "900" }}>{headline}</Text>
    <Text style={{ color: "#7E6F7D", fontSize: 16 }}>Unlock expanded creative tools and other ongoing membership features.</Text>
    {error ? <DegradedBanner message={error} /> : null}
    <View style={{ gap: 10 }}>{packages.map((item, index) => <PriceRow key={item.productIdentifier} item={item} selected={selected === index} />)}</View>
    <ActionButton title={chosen ? `Continue with ${chosen.title}` : "Choose a plan"} busy={busy} disabled={!chosen} onPress={async () => { if (!chosen) return; setBusy(true); setError(undefined); const next = await coordinator.purchase(chosen); setSession(next); setBusy(false); if (next.errorCode) setError(`Purchase state: ${next.errorCode}`); }} />
    <ActionButton title="Restore Purchases" onPress={async () => { setBusy(true); const next = await coordinator.restore(); setSession(next); setBusy(false); }} />
    <Text style={{ color: "#7E6F7D", fontSize: 12 }}>Prices and billing terms are provided by Apple and may vary by region. See your App Store purchase confirmation for final pricing.</Text>
  </ScrollView>;
}
