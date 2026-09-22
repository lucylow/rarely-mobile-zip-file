import React, { useMemo } from "react";
import { ScrollView, Text } from "react-native";
import { DebugRow, MockModeBadge, ReleaseSection } from "../../components/release";
import { MOCK_RARE_MOMENTS, MOCK_JOURNAL_ENTRIES } from "../../lib/release/mocks";

export default function ReleaseDiagnosticsScreen() {
  const counts = useMemo(() => ({ moments: MOCK_RARE_MOMENTS.length, journals: MOCK_JOURNAL_ENTRIES.length }), []);
  return <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}><Text style={{ fontSize: 30, fontWeight: "900" }}>Diagnostics</Text><MockModeBadge visible={__DEV__} /><ReleaseSection title="Release health"><DebugRow label="Mock moments" value={String(counts.moments)} /><DebugRow label="Mock journals" value={String(counts.journals)} /><DebugRow label="JS runtime" value={typeof HermesInternal === "undefined" ? "unknown" : "Hermes"} /><DebugRow label="Environment" value={__DEV__ ? "development" : "production"} /></ReleaseSection></ScrollView>;
}
