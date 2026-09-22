import React, { useState } from "react";
import { ScrollView, Text } from "react-native";
import { ConsentRow, ReleaseSection } from "../../components/release";
import { DEFAULT_CONSENT, privacyRows, type ConsentState } from "../../lib/release/privacy";

export default function ReleasePrivacyScreen() {
  const [consent, setConsent] = useState<ConsentState>(DEFAULT_CONSENT);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}><Text style={{ fontSize: 30, fontWeight: "900" }}>Privacy</Text><Text style={{ color: "#7E6F7D" }}>Keep optional data controls visible and easy to change.</Text><ReleaseSection title="Your choices">{privacyRows(consent).map((row) => <ConsentRow key={row.id} title={row.title} detail={row.detail} value={row.enabled} onChange={(enabled) => setConsent((current) => ({ ...current, [row.id]: enabled }))} />)}</ReleaseSection><ReleaseSection title="Private by default"><Text>Your journal text is not used as recommendation context. Cloud continuity stays off until you choose it.</Text></ReleaseSection></ScrollView>;
}
