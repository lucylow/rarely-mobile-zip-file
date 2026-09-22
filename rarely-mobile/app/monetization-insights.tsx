import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { Snackbar } from "@/components/ui/snackbar";
import {
  getDefaultMonetizationExperimentState,
  getDefaultMonetizationPromptState,
  getDefaultMonetizationState,
  getMembershipLabel,
  getPaywallConversionRate,
  getPaywallSourceLabel,
  getRankedPaywallSourceGroups,
  getRankedPaywallSources,
  REVENUE_CATALOG,
  loadMonetizationExperimentState,
  loadMonetizationPromptState,
  loadMonetizationState,
  resetMonetizationAnalytics,
  type MonetizationExperimentState,
  type MonetizationPromptState,
  type MonetizationState,
} from "@/lib/ux/monetization";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";

function percentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function totalSourceConversions(metrics: {
  trialStarts: number;
  planPurchases: number;
  restores: number;
}): number {
  return metrics.trialStarts + metrics.planPurchases + metrics.restores;
}

function formatDate(value?: string): string {
  if (!value) return "unknown";
  const millis = new Date(value).getTime();
  if (!Number.isFinite(millis)) return "unknown";
  return new Date(millis).toLocaleDateString();
}

export default function MonetizationInsightsScreen() {
  const [membership, setMembership] = useState<MonetizationState>(() => getDefaultMonetizationState());
  const [promptState, setPromptState] = useState<MonetizationPromptState>(() => getDefaultMonetizationPromptState());
  const [experiment, setExperiment] = useState<MonetizationExperimentState>(() =>
    getDefaultMonetizationExperimentState("value-first"),
  );
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);

  const load = useCallback(async (isActive: () => boolean) => {
    try {
      const [nextMembership, nextPromptState, nextExperiment] = await Promise.all([
        loadMonetizationState(AsyncStorage),
        loadMonetizationPromptState(AsyncStorage),
        loadMonetizationExperimentState(AsyncStorage),
      ]);
      if (!isActive()) return;
      setMembership(nextMembership);
      setPromptState(nextPromptState);
      setExperiment(nextExperiment);
    } catch {
      if (isActive()) setSnackbar("Could not load monetization metrics");
    }
  }, []);

  useAsyncFocusEffect(load, [load]);

  const conversionRate = useMemo(() => getPaywallConversionRate(experiment), [experiment]);
  const totalConversions = totalSourceConversions(experiment);
  const rankedSources = useMemo(() => getRankedPaywallSources(experiment), [experiment]);
  const groupedSources = useMemo(() => getRankedPaywallSourceGroups(experiment), [experiment]);
  const actionsDisabled = refreshing || resetting;

  const refresh = useCallback(async () => {
    if (actionsDisabled) return;
    setRefreshing(true);
    try {
      await load(() => true);
    } catch {
      setSnackbar("Could not refresh metrics");
    } finally {
      setRefreshing(false);
    }
  }, [actionsDisabled, load]);

  const resetAnalytics = useCallback(() => {
    if (actionsDisabled) return;
    Alert.alert(
      "Reset monetization analytics?",
      "This clears local prompt and experiment counters. It does not change your membership status.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            setResetting(true);
            try {
              const nextExperiment = await resetMonetizationAnalytics(AsyncStorage, true);
              setPromptState(getDefaultMonetizationPromptState());
              setExperiment(nextExperiment);
              setSnackbar("Monetization analytics reset");
            } catch {
              setSnackbar("Could not reset analytics right now");
            } finally {
              setResetting(false);
            }
          },
        },
      ],
    );
  }, [actionsDisabled]);

  return (
    <ScreenContainer className="px-5 pt-3">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
          <Text style={styles.headerLabel}>MONETIZATION INSIGHTS</Text>
          <View style={styles.spacer} />
        </View>

        <Text style={styles.title}>Track your local paywall performance.</Text>
        <Text style={styles.subtitle}>
          Metrics are stored on this device and meant for quick product iteration before backend analytics.
        </Text>

        <View style={styles.sourcesCard}>
          <Text style={styles.sourcesTitle}>Revenue lanes</Text>
          <Text style={styles.sourcesEmpty}>Each lane is measured separately so future revenue is not double-counted.</Text>
          {REVENUE_CATALOG.map((stream) => (
            <View key={stream.id} style={styles.revenueRow} accessibilityLabel={`${stream.label}: ${stream.enabledByDefault ? "enabled" : "planned"}`}>
              <View style={styles.sourceNameWrap}>
                <Text style={styles.sourceName}>{stream.label}</Text>
                <Text style={styles.sourceMeta}>{stream.description}</Text>
              </View>
              <Text style={styles.sourceRate}>{stream.enabledByDefault ? "Enabled" : "Planned"}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Membership state</Text>
          <Text style={styles.cardValue}>{getMembershipLabel(membership)}</Text>
          <Text style={styles.meta}>
            Source: {membership.source ?? "none"} {membership.startedAt ? `· Started ${formatDate(membership.startedAt)}` : ""}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Experiment variant</Text>
          <Text style={styles.cardValue}>{experiment.variant}</Text>
          <Text style={styles.meta}>
            Assigned {formatDate(experiment.assignedAt)} · Last source: {experiment.lastSource ?? "none"}
          </Text>
        </View>

        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Impressions</Text>
            <Text style={styles.metricValue}>{experiment.impressions}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Conversions</Text>
            <Text style={styles.metricValue}>{totalConversions}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Conversion rate</Text>
            <Text style={styles.metricValue}>{percentage(conversionRate)}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Prompt shown</Text>
            <Text style={styles.metricValue}>{promptState.shownCount}</Text>
          </View>
        </View>

        <View style={styles.breakdown}>
          <Text style={styles.breakdownTitle}>Conversion breakdown</Text>
          <Text style={styles.breakdownItem}>Trials: {experiment.trialStarts}</Text>
          <Text style={styles.breakdownItem}>Purchases: {experiment.planPurchases}</Text>
          <Text style={styles.breakdownItem}>Restores: {experiment.restores}</Text>
          <Text style={styles.breakdownMeta}>Last prompt source: {promptState.lastSource ?? "none"}</Text>
        </View>

        <View style={styles.sourcesCard}>
          <Text style={styles.sourcesTitle}>Top converting source groups</Text>
          {groupedSources.length === 0 ? (
            <Text style={styles.sourcesEmpty}>No source metrics yet. Open membership from different entry points first.</Text>
          ) : (
            groupedSources.map((row) => {
              const conversions = totalSourceConversions(row.metrics);
              return (
                <View key={row.source} style={styles.sourceRow}>
                  <View style={styles.sourceNameWrap}>
                    <Text numberOfLines={1} style={styles.sourceName}>
                      {row.source}
                    </Text>
                    <Text style={styles.sourceMeta}>
                      {row.metrics.impressions} impressions · {conversions} conversions
                    </Text>
                  </View>
                  <Text style={styles.sourceRate}>{percentage(row.conversionRate)}</Text>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.sourcesCard}>
          <Text style={styles.sourcesTitle}>Top converting sources</Text>
          {rankedSources.length === 0 ? (
            <Text style={styles.sourcesEmpty}>No source metrics yet.</Text>
          ) : (
            rankedSources.slice(0, 8).map((row) => {
              const conversions = totalSourceConversions(row.metrics);
              return (
                <View key={row.source} style={styles.sourceRow}>
                  <View style={styles.sourceNameWrap}>
                    <Text numberOfLines={1} style={styles.sourceName}>
                      {getPaywallSourceLabel(row.source)}
                    </Text>
                    <Text numberOfLines={1} style={styles.sourceKey}>
                      {row.source}
                    </Text>
                    <Text style={styles.sourceMeta}>
                      {row.metrics.impressions} impressions · {conversions} conversions
                    </Text>
                  </View>
                  <Text style={styles.sourceRate}>{percentage(row.conversionRate)}</Text>
                </View>
              );
            })
          )}
        </View>

        <Pressable
          onPress={() => void refresh()}
          style={({ pressed }) => [styles.actionButton, actionsDisabled && styles.actionDisabled, pressed && styles.pressed]}
          disabled={actionsDisabled}
        >
          <Text style={styles.actionText}>{refreshing ? "Refreshing..." : resetting ? "Please wait..." : "Refresh metrics"}</Text>
        </Pressable>
        <Pressable
          onPress={resetAnalytics}
          style={({ pressed }) => [styles.resetButton, actionsDisabled && styles.actionDisabled, pressed && styles.pressed]}
          disabled={actionsDisabled}
        >
          <Text style={styles.resetText}>{resetting ? "Resetting..." : "Reset analytics counters"}</Text>
        </Pressable>
      </ScrollView>
      <Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} bottomOffset={20} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  backButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  backArrow: { color: "#2B1D2F", fontSize: 30, lineHeight: 34, marginTop: -4 },
  headerLabel: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 2 },
  spacer: { width: 42 },
  title: { color: "#2B1D2F", fontSize: 30, lineHeight: 36, fontWeight: "700" },
  subtitle: { color: "#7E6F7D", fontSize: 14, lineHeight: 20, marginTop: 8, marginBottom: 16 },
  card: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 18, padding: 14, marginTop: 10 },
  cardLabel: { color: "#9C8D99", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.1 },
  cardValue: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 6 },
  meta: { color: "#7E6F7D", fontSize: 12, marginTop: 5, lineHeight: 17 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  metricCard: { width: "47%", backgroundColor: "#FFF4E8", borderColor: "#F1D5C3", borderWidth: 1, borderRadius: 14, padding: 12 },
  metricLabel: { color: "#7E6F7D", fontSize: 11, fontWeight: "700" },
  metricValue: { color: "#2B1D2F", fontSize: 24, fontWeight: "700", marginTop: 6 },
  breakdown: { backgroundColor: "#D9CDE7", borderRadius: 18, padding: 14, marginTop: 12 },
  breakdownTitle: { color: "#2B1D2F", fontSize: 15, fontWeight: "700" },
  breakdownItem: { color: "#2B1D2F", fontSize: 13, marginTop: 5 },
  breakdownMeta: { color: "#5F4A5E", fontSize: 11, marginTop: 8 },
  sourcesCard: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 18, padding: 14, marginTop: 12 },
  sourcesTitle: { color: "#2B1D2F", fontSize: 15, fontWeight: "700" },
  sourcesEmpty: { color: "#7E6F7D", fontSize: 12, lineHeight: 17, marginTop: 8 },
  sourceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, gap: 10 },
  revenueRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: 10, gap: 12 },
  sourceNameWrap: { flex: 1 },
  sourceName: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" },
  sourceKey: { color: "#9C8D99", fontSize: 10, marginTop: 1 },
  sourceMeta: { color: "#7E6F7D", fontSize: 11, marginTop: 2 },
  sourceRate: { color: "#2B1D2F", fontSize: 15, fontWeight: "700" },
  actionButton: { backgroundColor: "#2B1D2F", borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  actionText: { color: "#FFF7F2", fontSize: 14, fontWeight: "700" },
  resetButton: { borderColor: "#E5D8D4", borderWidth: 1, borderRadius: 16, paddingVertical: 13, alignItems: "center", marginTop: 10 },
  resetText: { color: "#B96861", fontSize: 13, fontWeight: "700" },
  actionDisabled: { opacity: 0.6 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.986 }] },
});
