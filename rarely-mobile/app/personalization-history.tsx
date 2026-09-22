import { useCallback, useState } from "react";
import { useColors } from "@/hooks/use-colors";
import { createAppTheme, type AppTheme } from "@/lib/design/theme";
import { hitTargets, radii, spacing, typography } from "@/lib/design/tokens";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { clearPersonalizationHistory, loadPersonalizationHistory, restorePersonalizationHistory, type PersonalizationHistoryItem } from "@/lib/ux/localStorage";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { describeRecommendationSignal } from "@/lib/ux/personalization";

const moodLabels: Record<string, string> = { happy: "Happy", stressed: "Stressed", creative: "Creative", tired: "Tired", excited: "Excited", vibing: "Just vibing" };
type Signal = PersonalizationHistoryItem;

function signalLabel(signal: Signal): string {
  if (signal.kind === "mood") return `You checked in as ${moodLabels[signal.value] ?? signal.value}`;
  if (signal.kind === "recommendation") return describeRecommendationSignal(signal.value);
  return signal.value;
}

export default function PersonalizationHistoryScreen() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const theme = createAppTheme(useColors());
  const styles = createStyles(theme);
  const loadSignals = useCallback(async (isActive: () => boolean) => {
    const history = await loadPersonalizationHistory();
    if (!isActive()) return;
    setSignals(history);
  }, []);
  useAsyncFocusEffect(loadSignals, [loadSignals]);
  const clearHistory = () =>
    Alert.alert(
      "Clear personalization history?",
      "This removes the visible record of your recommendation signals. Your preferences and memories stay on this device.",
      [
        { text: "Keep history", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            const previousSignals = signals;
            try {
              await clearPersonalizationHistory();
              setSignals([]);
              Alert.alert("History cleared", "Your recommendation history is hidden from this device.", [
                { text: "Done", style: "cancel" },
                {
                  text: "Undo",
                  onPress: async () => {
                    try {
                      await restorePersonalizationHistory(previousSignals);
                      setSignals(previousSignals);
                    } catch {
                      Alert.alert("Could not restore history", "Your personalization history could not be restored right now.");
                    }
                  },
                },
              ]);
            } catch {
              Alert.alert("Could not clear history", "Your personalization history could not be cleared right now.");
            }
          },
        },
      ],
    );
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
      <Text style={styles.kicker}>YOUR SIGNALS</Text>
      <Text style={styles.title}>A transparent memory of your choices.</Text>
      <Text style={styles.subtitle}>RARELY uses these small local signals to shape recommendations. Your journal words and private images never appear here.</Text>
      {signals.length ? <FlatList data={signals} keyExtractor={(item, index) => `${item.at}-${index}`} contentContainerStyle={styles.list} renderItem={({ item }) => <View style={styles.card}><View style={styles.dot}><Text style={styles.dotText}>✦</Text></View><View style={styles.copy}><Text style={styles.cardTitle}>{signalLabel(item)}</Text><Text style={styles.date}>{new Date(item.at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} · {new Date(item.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</Text></View></View>} /> : <View style={styles.empty}><Text style={styles.emptyIcon}>◌</Text><Text style={styles.emptyTitle}>Nothing to show yet.</Text><Text style={styles.emptyBody}>Choose a mood on Home and your first local signal will appear here.</Text></View>}
      {signals.length ? <Pressable accessibilityRole="button" accessibilityLabel="Clear personalization history" onPress={clearHistory} style={styles.clear}><Text style={styles.clearText}>Clear history</Text></Pressable> : null}<Pressable accessibilityRole="button" accessibilityLabel="Back to Preferences" onPress={() => router.replace("/preferences")} style={styles.primary}><Text style={styles.primaryText}>Back to Preferences</Text></Pressable>
    </ScreenContainer>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    back: { width: hitTargets.compact, height: hitTargets.compact, borderRadius: radii.pill, backgroundColor: theme.surface, alignItems: "center", justifyContent: "center" },
    backText: { color: theme.ink, fontSize: 32, lineHeight: 34, marginTop: -spacing.xs },
    kicker: { color: theme.accent, fontSize: typography.kicker.fontSize, lineHeight: typography.kicker.lineHeight, fontWeight: "800", letterSpacing: typography.kicker.letterSpacing, marginTop: spacing.xl },
    title: { color: theme.ink, fontSize: typography.title.fontSize, lineHeight: typography.title.lineHeight, fontWeight: "700", marginTop: spacing.sm },
    subtitle: { color: theme.mutedInk, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, marginTop: spacing.sm },
    list: { paddingVertical: spacing.xl, gap: spacing.sm },
    card: { backgroundColor: theme.elevatedSurface, borderColor: theme.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: spacing.md },
    dot: { width: 36, height: 36, borderRadius: radii.pill, backgroundColor: theme.canvas, alignItems: "center", justifyContent: "center" },
    dotText: { color: theme.accent, fontSize: 18 },
    copy: { flex: 1 },
    cardTitle: { color: theme.ink, fontSize: typography.card.fontSize, lineHeight: typography.card.lineHeight, fontWeight: "700" },
    date: { color: theme.mutedInk, fontSize: typography.metadata.fontSize, lineHeight: typography.metadata.lineHeight, marginTop: spacing.xs },
    empty: { alignItems: "center", paddingHorizontal: spacing.lg, paddingTop: spacing.display, flex: 1 },
    emptyIcon: { color: theme.accent, fontSize: 34 },
    emptyTitle: { color: theme.ink, fontSize: 21, lineHeight: 28, fontWeight: "700", marginTop: spacing.md },
    emptyBody: { color: theme.mutedInk, fontSize: typography.body.fontSize, lineHeight: typography.body.lineHeight, textAlign: "center", marginTop: spacing.xs },
    clear: { borderColor: theme.border, borderWidth: 1, borderRadius: radii.md, paddingVertical: spacing.md, alignItems: "center", marginBottom: spacing.sm },
    clearText: { color: theme.danger, fontSize: 13, lineHeight: 18, fontWeight: "700" },
    primary: { backgroundColor: theme.ink, borderRadius: radii.lg, paddingVertical: spacing.lg, alignItems: "center", marginTop: "auto", marginBottom: spacing.sm },
    primaryText: { color: theme.canvas, fontSize: typography.button.fontSize, lineHeight: typography.button.lineHeight, fontWeight: "700" },
  });
}
