import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { SyncStatus } from "../../lib/ux/upgrade/sync";

export const SyncStatusChip = memo(function SyncStatusChip({ status }: { status: SyncStatus }) {
  const label = status.state === "syncing" ? "Syncing…" : status.state === "error" ? "Sync needs attention" : status.pending ? `${status.pending} waiting` : "Up to date";
  return (
    <View accessibilityRole="text" accessibilityLabel={`Sync status: ${label}`} style={[styles.chip, status.state === "error" && styles.error, status.state === "syncing" && styles.syncing]}>
      <View style={styles.dot} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  chip: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, backgroundColor: "#ECE7EA" },
  syncing: { backgroundColor: "#EFE7F4" },
  error: { backgroundColor: "#F8E4E7" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#6C596F" },
  label: { fontSize: 12, fontWeight: "700", color: "#554453" },
});
