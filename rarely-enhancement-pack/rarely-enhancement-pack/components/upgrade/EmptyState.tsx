import React from "react";
import { StyleSheet, Text, View } from "react-native";

export function UpgradeEmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <View accessibilityRole="summary" style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({ container: { padding: 18, borderRadius: 22, backgroundColor: "#F4EFF2", gap: 6 }, title: { fontSize: 17, fontWeight: "800", color: "#3B293A" }, detail: { color: "#6B5967", lineHeight: 20 } });
