import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { DailyBrief, DailyBriefItem } from "../../lib/ux/upgrade/types";

export interface DailyBriefCardProps { brief: DailyBrief; onSelect?: (item: DailyBriefItem) => void; }

export const DailyBriefCard = memo(function DailyBriefCard({ brief, onSelect }: DailyBriefCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>{brief.greeting}</Text>
      <Text style={styles.theme}>{brief.theme}</Text>
      <Text style={styles.footer}>{brief.footer}</Text>
      <View style={styles.items}>
        {brief.items.map((item) => (
          <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={item.title} onPress={() => onSelect?.(item)} style={({ pressed }: { pressed: boolean }) => [styles.item, pressed && styles.pressed]}>
            <View style={styles.itemHeader}>
              <Text style={styles.kind}>{item.kind}</Text>
              <Text style={styles.minutes}>{item.minutes} min</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.detail}>{item.detail}</Text>
            <Text style={styles.reason}>{item.reason}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { gap: 8, padding: 20, borderRadius: 28, backgroundColor: "#FFF4ED" },
  greeting: { fontSize: 13, color: "#7A5D62", letterSpacing: 0.5 },
  theme: { fontSize: 25, lineHeight: 30, fontWeight: "800", color: "#3E2934" },
  footer: { color: "#6F5A60", lineHeight: 19 },
  items: { gap: 10, marginTop: 8 },
  item: { padding: 14, borderRadius: 18, backgroundColor: "#FFFFFF" },
  pressed: { opacity: 0.82 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between" },
  kind: { fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#9A6B77" },
  minutes: { fontSize: 11, color: "#8E777D" },
  title: { marginTop: 6, fontWeight: "700", fontSize: 17, color: "#3F2E39" },
  detail: { marginTop: 3, lineHeight: 19, color: "#5F4D55" },
  reason: { marginTop: 6, fontSize: 12, color: "#8A737A" },
});