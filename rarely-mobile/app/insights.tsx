import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import { createExpoUpgradeStorage } from "../lib/ux/upgrade/expoStorage";
import { createUpgradeService } from "../lib/ux/upgrade/upgradeService";
import { buildInsights } from "../lib/ux/upgrade/insights";
import { InsightCard } from "../components/upgrade/InsightCard";

export default function InsightsScreen() {
  const service = useMemo(() => createUpgradeService({ storage: createExpoUpgradeStorage() }), []);
  const [insights, setInsights] = useState<ReturnType<typeof buildInsights>>([]);
  useEffect(() => { void (async () => { const snapshot = await service.activity.hydrate(); setInsights(buildInsights(snapshot.events)); })(); }, [service]);
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>PERSONAL PATTERNS</Text>
        <Text style={styles.title}>Useful, not competitive.</Text>
        <Text style={styles.description}>These observations focus on meaningful actions rather than time spent inside the app.</Text>
        {insights.map((insight) => <InsightCard key={insight.id} insight={insight} />)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: "#FBF7F2" }, content: { padding: 20, gap: 14, paddingBottom: 48 }, kicker: { fontSize: 11, letterSpacing: 1.5, color: "#8B6D78", fontWeight: "700" }, title: { fontSize: 32, fontWeight: "800", color: "#352536" }, description: { lineHeight: 21, color: "#675565", marginBottom: 4 } });
