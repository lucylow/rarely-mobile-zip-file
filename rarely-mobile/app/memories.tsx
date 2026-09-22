import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text } from "react-native";
import { createExpoUpgradeStorage } from "../lib/ux/upgrade/expoStorage";
import { createUpgradeService, hydrateUpgradeService } from "../lib/ux/upgrade/upgradeService";
import { MemorySection } from "../components/upgrade/MemorySection";

export default function MemoriesScreen() {
  const service = useMemo(() => createUpgradeService({ storage: createExpoUpgradeStorage() }), []);
  const [memories, setMemories] = useState(service.memories.snapshot().memories);
  const refresh = useCallback(async () => {
    const activity = await hydrateUpgradeService(service);
    const result = await service.memories.refresh(activity.events, {});
    setMemories(result.memories);
  }, [service]);
  useEffect(() => { void refresh(); }, [refresh]);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>PERSONAL MEMORY</Text>
        <Text style={styles.title}>What RARELY remembers.</Text>
        <Text style={styles.description}>Small, editable signals—not a score of who you are. Remove anything you do not want used for future recommendations.</Text>
        <MemorySection memories={memories} onRemove={async (memory) => { await service.memories.remove(memory.id); await refresh(); Alert.alert("Removed", "That memory will no longer shape upgrade recommendations."); }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: "#FBF7F2" }, content: { padding: 20, gap: 10, paddingBottom: 48 }, kicker: { fontSize: 11, letterSpacing: 1.5, color: "#8B6D78", fontWeight: "700" }, title: { fontSize: 32, fontWeight: "800", color: "#352536" }, description: { lineHeight: 21, color: "#675565", marginBottom: 6 } });
