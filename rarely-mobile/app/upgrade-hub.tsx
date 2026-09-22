import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { createExpoUpgradeStorage } from "../lib/ux/upgrade/expoStorage";
import { createUpgradeService, hydrateUpgradeService } from "../lib/ux/upgrade/upgradeService";
import { buildDailyBrief } from "../lib/ux/upgrade/dailyBrief";
import { buildInsights } from "../lib/ux/upgrade/insights";
import { DEFAULT_ROUTINES } from "../lib/ux/upgrade/routineEngine";
import { DailyBriefCard } from "../components/upgrade/DailyBriefCard";
import { InsightCard } from "../components/upgrade/InsightCard";
import { MemorySection } from "../components/upgrade/MemorySection";

export default function UpgradeHubScreen() {
  const router = useRouter();
  const service = useMemo(() => createUpgradeService({ storage: createExpoUpgradeStorage() }), []);
  const [events, setEvents] = useState(service.activity.snapshot().events);
  const [memories, setMemories] = useState(service.memories.snapshot().memories);

  const refresh = useCallback(async () => {
    const activity = await hydrateUpgradeService(service);
    const memory = await service.memories.refresh(activity.events, {});
    setEvents(activity.events);
    setMemories(memory.memories);
  }, [service]);

  useEffect(() => { void refresh(); }, [refresh]);
  const brief = buildDailyBrief(events, { memories, routines: DEFAULT_ROUTINES });
  const insights = buildInsights(events);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.kicker}>RARELY / MORE YOU</Text>
          <Text style={styles.title}>A little room around your day.</Text>
          <Text style={styles.subtitle}>Personal memory, gentle insights, and useful moments—without turning your life into a scoreboard.</Text>
        </View>

        <DailyBriefCard brief={brief} onSelect={(item) => {
          if (item.kind === "ritual") router.push("/(tabs)/studio" as never);
          if (item.kind === "reflection") router.push("/journal" as never);
        }} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Things you return to</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/memories" as never)}><Text style={styles.link}>See all</Text></Pressable>
        </View>
        <MemorySection memories={memories.slice(0, 3)} onRemove={async (memory) => { await service.memories.remove(memory.id); await refresh(); }} />

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your recent pattern</Text>
          <Pressable accessibilityRole="button" onPress={() => router.push("/insights" as never)}><Text style={styles.link}>See all</Text></Pressable>
        </View>
        <View style={styles.stack}>{insights.slice(0, 4).map((insight) => <InsightCard key={insight.id} insight={insight} />)}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FBF7F2" },
  content: { padding: 20, gap: 18, paddingBottom: 48 },
  hero: { gap: 8 },
  kicker: { fontSize: 11, letterSpacing: 1.6, color: "#8B6D78", fontWeight: "700" },
  title: { fontSize: 34, lineHeight: 38, fontWeight: "800", color: "#352536" },
  subtitle: { lineHeight: 21, color: "#675565" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  sectionTitle: { fontSize: 21, fontWeight: "800", color: "#3B293A" },
  link: { fontWeight: "700", color: "#744D69" },
  stack: { gap: 10 },
});
