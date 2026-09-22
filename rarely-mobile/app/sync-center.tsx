import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from "react-native";
import { createExpoUpgradeStorage } from "../lib/ux/upgrade/expoStorage";
import { createUpgradeService } from "../lib/ux/upgrade/upgradeService";
import { SyncStatusChip } from "../components/upgrade/SyncStatusChip";

export default function SyncCenterScreen() {
  const service = useMemo(() => createUpgradeService({ storage: createExpoUpgradeStorage() }), []);
  const [status, setStatus] = useState(service.sync.getStatus());
  useEffect(() => { void (async () => setStatus(await service.sync.hydrate()))(); }, [service]);
  const settings = service.privacy.getSettings();
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>CONTINUITY</Text>
        <Text style={styles.title}>Your devices can remember, selectively.</Text>
        <SyncStatusChip status={status} />
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>What is eligible?</Text>
          <Text style={styles.row}>Personal activity: {settings.syncPersonalEvents ? "On" : "Off"}</Text>
          <Text style={styles.row}>Private journals: {settings.syncPrivateJournals ? "On" : "Off by default"}</Text>
          <Text style={styles.row}>Secret-like data: Never</Text>
          <Text style={styles.row}>Pending local events: {status.pending}</Text>
        </View>
        <Text style={styles.description}>Sync is an append-only continuity channel. It does not need to become a mirror of every private thing on this device.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: "#FBF7F2" }, content: { padding: 20, gap: 18 }, kicker: { fontSize: 11, letterSpacing: 1.5, color: "#8B6D78", fontWeight: "700" }, title: { fontSize: 31, lineHeight: 36, fontWeight: "800", color: "#352536" }, panel: { padding: 18, borderRadius: 22, backgroundColor: "#FFF9F2", borderWidth: 1, borderColor: "#EADFDA", gap: 8 }, panelTitle: { fontSize: 18, fontWeight: "800", color: "#3C2B3B" }, row: { color: "#624F5D", lineHeight: 20 }, description: { lineHeight: 21, color: "#6C596F" } });
