import React, { memo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { Insight } from "../../lib/ux/upgrade/types";

export interface InsightCardProps { key?: string; insight: Insight; onAction?: (insight: Insight) => void; }

export const InsightCard = memo(function InsightCard({ insight, onAction }: InsightCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.metricRow}>
        <Text style={styles.metric}>{formatMetric(insight.metric, insight.unit)}</Text>
        <Text style={styles.period}>{insight.periodLabel}</Text>
      </View>
      <Text style={styles.title}>{insight.title}</Text>
      <Text style={styles.summary}>{insight.summary}</Text>
      <View style={styles.evidence}>
        {insight.evidence.slice(0, 3).map((line) => <Text key={line} style={styles.evidenceLine}>- {line}</Text>)}
      </View>
      {insight.action && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={insight.action.label} onPress={() => onAction(insight)} style={styles.action}>
          <Text style={styles.actionText}>{insight.action.label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
});

function formatMetric(metric: number, unit: string): string {
  return unit === "streak progress" ? `${Math.round(metric * 100)}%` : `${Math.round(metric)} ${unit}`;
}

const styles = StyleSheet.create({
  card: { gap: 8, padding: 18, borderRadius: 24, backgroundColor: "#F3EBF6", borderWidth: 1, borderColor: "#DCC8E2" },
  metricRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline" },
  metric: { fontSize: 18, fontWeight: "800", color: "#38263A" },
  period: { fontSize: 11, color: "#7C697D" },
  title: { fontSize: 20, fontWeight: "700", color: "#38263A" },
  summary: { lineHeight: 21, color: "#5D4A60" },
  evidence: { gap: 4, marginTop: 4 },
  evidenceLine: { fontSize: 13, color: "#6C596F" },
  action: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: "#FFFFFF" },
  actionText: { fontWeight: "700", color: "#5A3D67" },
});