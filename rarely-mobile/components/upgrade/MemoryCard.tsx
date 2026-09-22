import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { MemoryItem } from "../../lib/ux/upgrade/types";

export interface MemoryCardProps { key?: string; memory: MemoryItem; onRemove?: (memory: MemoryItem) => void; onPress?: (memory: MemoryItem) => void; }

export const MemoryCard = memo(function MemoryCard({ memory, onRemove, onPress }: MemoryCardProps) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${memory.label}: ${memory.value}`} onPress={() => onPress?.(memory)} style={({ pressed }: { pressed: boolean }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}><Text style={styles.label}>{memory.label}</Text><Text style={styles.confidence}>{Math.round(memory.confidence * 100)}%</Text></View>
      <Text style={styles.value}>{memory.value}</Text>
      <Text style={styles.explanation}>{memory.explanation}</Text>
      <View style={styles.footer}>
        <Text style={styles.source}>{memory.source === "explicit" ? "You told RARELY" : "Learned from your activity"}</Text>
        {onRemove ? <Pressable accessibilityRole="button" accessibilityLabel={`Remove memory about ${memory.value}`} onPress={() => onRemove(memory)} hitSlop={8}><Text style={styles.remove}>Remove</Text></Pressable> : null}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { gap: 8, padding: 16, borderRadius: 20, backgroundColor: "#FFF9F1", borderWidth: 1, borderColor: "#EADFDA" },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 12, letterSpacing: 1.2, textTransform: "uppercase", color: "#6D5A69" },
  confidence: { fontSize: 12, color: "#8C6B7C" },
  value: { fontSize: 23, fontWeight: "700", color: "#38263A" },
  explanation: { lineHeight: 20, color: "#5C4A5D" },
  footer: { marginTop: 4, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  source: { fontSize: 12, color: "#85717F" },
  remove: { fontWeight: "700", color: "#A3485B" },
});