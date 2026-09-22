import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DegradedBanner, MockModeBadge, ReleaseSection } from "../../components/release";
import { MOCK_FAULTS, MOCK_RARE_MOMENTS } from "../../lib/release/mocks";

export default function MockPlaygroundScreen() {
  const [fault, setFault] = useState<string>();
  const sample = useMemo(() => MOCK_RARE_MOMENTS.slice(0, 10), []);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}><MockModeBadge visible /><Text style={{ fontSize: 30, fontWeight: "900" }}>Mock playground</Text><Text style={{ color: "#7E6F7D" }}>Use these controls to reproduce release edge cases without touching real user state.</Text><ReleaseSection title="Fault injection">{Object.entries(MOCK_FAULTS).flatMap(([group, faults]) => faults.map((item) => <Pressable key={`${group}-${item.id}`} onPress={() => setFault(item.code)} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: "#EDE4E0" }}><Text style={{ fontWeight: "700" }}>{group}: {item.id}</Text><Text>{item.description}</Text></Pressable>))}</ReleaseSection>{fault ? <DegradedBanner message={`Injected fault: ${fault}`} /> : null}<ReleaseSection title="Sample moments">{sample.map((item) => <View key={item.id} style={{ padding: 12, borderRadius: 14, backgroundColor: "#FFFFFF" }}><Text style={{ fontWeight: "800" }}>{item.title}</Text><Text>{item.summary}</Text></View>)}</ReleaseSection></ScrollView>;
}
