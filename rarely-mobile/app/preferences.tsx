import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { createAppTheme, type AppTheme } from "@/lib/design/theme";
import { hitTargets, radii, spacing, typography } from "@/lib/design/tokens";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { scorePreferences, type Preferences } from "@/lib/ux/onboardingPersonalization";
import { safeJsonParse } from "@/lib/utils";
import { clearRecommendationFeedback } from "@/lib/ux/localStorage";
import { resetPersonalizationBestEffort } from "@/lib/ux/preferencesPersistence";

const interests: { key: keyof Omit<Preferences, "notifications" | "quietHours">; label: string; icon: string }[] = [
  { key: "creativity", label: "Creative ideas", icon: "✦" },
  { key: "journaling", label: "Journaling", icon: "✍︎" },
  { key: "music", label: "Music discovery", icon: "♫" },
  { key: "community", label: "Positive community", icon: "♡" },
  { key: "beauty", label: "Beauty rituals", icon: "◒" },
];

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState<Preferences>(() => scorePreferences({}));
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showActivityNotePreviews, setShowActivityNotePreviews] = useState(true);
  const [busyAction, setBusyAction] = useState<"save" | "reset" | "feedback" | null>(null);
  const styles = createStyles(createAppTheme(useColors()));

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [preferencesValue, previewsValue] = await Promise.all([
          AsyncStorage.getItem("rarely.preferences"),
          AsyncStorage.getItem("rarely.showActivityNotePreviews"),
        ]);
        if (!active) return;
        setPreferences(scorePreferences(safeJsonParse(preferencesValue, {})));
        setShowActivityNotePreviews(previewsValue !== "false");
      } catch {
        if (!active) return;
        Alert.alert("Could not load preferences", "We could not load your saved preferences right now. You can still update and save again.");
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const toggle = (key: keyof Omit<Preferences, "notifications" | "quietHours">) => {
    setSaved(false);
    setHasUnsavedChanges(true);
    setPreferences((current) => ({ ...current, [key]: current[key] > 0.7 ? 0.5 : 1 }));
  };

  const clearFeedback = () => {
    if (busyAction) return;
    Alert.alert("Clear recommendation feedback?", "This removes only your likes and skips. Your preferences, journal, and memories stay on this device.", [
      { text: "Keep feedback", style: "cancel" },
      { text: "Clear", style: "destructive", onPress: async () => {
        setBusyAction("feedback");
        try {
          await clearRecommendationFeedback();
          Alert.alert("Feedback cleared", "RARELY will learn from your recommendations again.");
        } catch {
          Alert.alert("Could not clear feedback", "Your recommendation feedback could not be cleared right now.");
        } finally {
          setBusyAction(null);
        }
      } },
    ]);
  };

  const resetPersonalization = () => {
    if (busyAction) return;
    Alert.alert("Reset personalization?", "This clears your saved interests, starter path, and remembered mood. Your journal and scrapbook memories stay on this device.", [
      { text: "Keep my settings", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          setBusyAction("reset");
          try {
            const defaults = scorePreferences({});
            const result = await resetPersonalizationBestEffort(AsyncStorage, JSON.stringify(defaults));
            if (!result.preferencesSaved) {
              Alert.alert("Reset failed", "Your personalization settings could not be reset. Please try again.");
              return;
            }
            setPreferences(defaults);
            setSaved(true);
            setHasUnsavedChanges(false);
            if (!result.starterPathCleared || !result.lastMoodCleared) {
              Alert.alert("Reset partly completed", "Your new preferences were saved, but some remembered personalization data could not be cleared. You can try again later.");
            }
          } finally {
            setBusyAction(null);
          }
        },
      },
    ]);
  };

  const save = async () => {
    if (busyAction) return false;
    setBusyAction("save");
    try {
      await AsyncStorage.setItem("rarely.preferences", JSON.stringify(preferences));
      await AsyncStorage.setItem("rarely.showActivityNotePreviews", String(showActivityNotePreviews));
      setSaved(true);
      setHasUnsavedChanges(false);
      return true;
    } catch {
      Alert.alert("Save failed", "Your preferences could not be saved right now. Please try again.");
      return false;
    } finally {
      setBusyAction(null);
    }
  };

  const goBack = () => {
    if (!hasUnsavedChanges) {
      router.back();
      return;
    }
    Alert.alert("Unsaved changes", "Save your updated preferences before leaving this screen?", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
      {
        text: "Save and leave",
        onPress: async () => {
          const didSave = await save();
          if (didSave) router.back();
        },
      },
    ]);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={goBack} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerLabel}>PREFERENCES</Text><View style={styles.spacer} /></View>
        <Text style={styles.title}>Shape your RARELY.</Text><Image source={{ uri: "/manus-storage/rarely-preferences-care_3d033d8b.png" }} resizeMode="cover" accessibilityLabel="Personal care preferences visual" style={styles.heroVisual} />
        <Text style={styles.subtitle}>These choices guide your starter path. Nothing here is permanent.</Text>
        <View style={styles.list}>{interests.map((item) => { const active = preferences[item.key] > 0.7; return <Pressable key={item.key} accessibilityRole="button" accessibilityLabel={`${active ? "Disable" : "Enable"} ${item.label} preference`} onPress={() => toggle(item.key)} style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.pressed]}><Text style={styles.icon}>{item.icon}</Text><Text style={[styles.label, active && styles.labelActive]}>{item.label}</Text><View style={[styles.check, active && styles.checkActive]}>{active && <Text style={styles.checkText}>✓</Text>}</View></Pressable>; })}</View>
        <View style={styles.reminders}><View style={styles.reminderCopy}><Text style={styles.reminderTitle}>Gentle reminders</Text><Text style={styles.reminderBody}>Optional prompts for your Rare Moments.</Text></View><Switch accessibilityLabel="Gentle reminders" value={preferences.notifications} onValueChange={(value) => { setSaved(false); setHasUnsavedChanges(true); setPreferences((current) => ({ ...current, notifications: value })); }} trackColor={{ false: "#EDE4E0", true: "#E96F61" }} /></View>
        <View style={[styles.reminders, styles.privacyCard]}><Image source={{ uri: "/manus-storage/rarely-preferences-privacy_68d368dc.png" }} resizeMode="cover" accessibilityLabel="Local privacy visual" style={styles.privacyVisual} /><View style={styles.reminderCopy}><Text style={styles.reminderTitle}>Show private note previews</Text><Text style={styles.reminderBody}>Choose whether Scrapbook cards show a short preview of your local notes.</Text></View><Switch accessibilityLabel="Show private activity note previews" value={showActivityNotePreviews} onValueChange={(value) => { setSaved(false); setHasUnsavedChanges(true); setShowActivityNotePreviews(value); }} trackColor={{ false: "#EDE4E0", true: "#E96F61" }} /></View>
        <View style={styles.reminders}><View style={styles.reminderCopy}><Text style={styles.reminderTitle}>Quiet hours</Text><Text style={styles.reminderBody}>Use calmer, non-time-specific recommendation language after dark.</Text></View><Switch accessibilityLabel="Quiet hours for personalized prompts" value={preferences.quietHours} onValueChange={(value) => { setSaved(false); setHasUnsavedChanges(true); setPreferences((current) => ({ ...current, quietHours: value })); }} trackColor={{ false: "#EDE4E0", true: "#E96F61" }} /></View>
        <Pressable accessibilityRole="button" accessibilityLabel="View private AI prompt history" onPress={() => router.push("/ai-history" as never)} style={({ pressed }) => [styles.history, pressed && styles.pressed]}><Text style={styles.historyText}>View private AI prompt history</Text><Text style={styles.historyHint}>Replay or clear prompt metadata stored on this device</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="View local personalization history" onPress={() => router.push("/personalization-history")} style={({ pressed }) => [styles.history, pressed && styles.pressed]}><Text style={styles.historyText}>View personalization history</Text><Text style={styles.historyHint}>See what signals shape your recommendations</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Clear recommendation feedback without deleting memories" accessibilityState={{ disabled: Boolean(busyAction) }} disabled={Boolean(busyAction)} onPress={clearFeedback} style={({ pressed }) => [styles.feedbackReset, busyAction && styles.disabled, pressed && styles.pressed]}><Text style={styles.feedbackResetText}>{busyAction === "feedback" ? "Clearing feedback…" : "Clear recommendation feedback"}</Text><Text style={styles.feedbackResetHint}>Keeps preferences and memories</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Reset personalization without deleting memories" accessibilityState={{ disabled: Boolean(busyAction) }} disabled={Boolean(busyAction)} onPress={resetPersonalization} style={({ pressed }) => [styles.reset, busyAction && styles.disabled, pressed && styles.pressed]}><Text style={styles.resetText}>{busyAction === "reset" ? "Resetting…" : "Reset personalization"}</Text><Text style={styles.resetHint}>Keeps your journal and scrapbook</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={hasUnsavedChanges ? "Save preferences" : "No changes to save"} accessibilityState={{ disabled: !hasUnsavedChanges || Boolean(busyAction) }} disabled={!hasUnsavedChanges || Boolean(busyAction)} onPress={save} style={({ pressed }) => [styles.save, (!hasUnsavedChanges || busyAction) && styles.saveDisabled, pressed && styles.pressed]}><Text accessibilityLiveRegion="polite" style={styles.saveText}>{busyAction === "save" ? "Saving preferences…" : saved ? "Preferences saved ✓" : hasUnsavedChanges ? "Save preferences" : "No changes to save"}</Text></Pressable>
        <Text accessibilityLiveRegion="polite" style={styles.note}>{busyAction ? "Updating local settings…" : "Your preferences are stored locally on this device."}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({ scrollContent: { paddingBottom: 12 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, back: { width: hitTargets.compact, height: hitTargets.compact, borderRadius: radii.pill, backgroundColor: theme.surface, alignItems: "center", justifyContent: "center" }, backText: { color: theme.ink, fontSize: 32, lineHeight: 34, marginTop: -spacing.xs }, headerLabel: { color: theme.accent, fontSize: typography.kicker.fontSize, lineHeight: typography.kicker.lineHeight, fontWeight: "800", letterSpacing: typography.kicker.letterSpacing }, spacer: { width: 42 }, title: { color: theme.ink, fontSize: typography.title.fontSize, lineHeight: typography.title.lineHeight + 2, fontWeight: "700" }, heroVisual: { width: "100%", height: 118, borderRadius: 19, marginTop: 18 }, subtitle: { color: theme.mutedInk, fontSize: typography.body.fontSize + 1, lineHeight: typography.body.lineHeight, marginTop: spacing.sm }, list: { gap: 10, marginTop: 24 }, item: { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1, borderRadius: radii.lg, padding: spacing.md, flexDirection: "row", alignItems: "center", gap: 12 }, itemActive: { backgroundColor: theme.ink, borderColor: theme.ink }, icon: { color: theme.accent, fontSize: 20, lineHeight: 24 }, label: { color: theme.ink, fontSize: typography.card.fontSize, lineHeight: typography.card.lineHeight, fontWeight: "600", flex: 1 }, labelActive: { color: theme.canvas }, check: { width: 23, height: 23, borderRadius: 12, borderColor: "#D9CDE7", borderWidth: 1, alignItems: "center", justifyContent: "center" }, checkActive: { backgroundColor: "#E96F61", borderColor: "#E96F61" }, checkText: { color: "#FFF7F2", fontSize: 13, fontWeight: "800" }, reminders: { backgroundColor: "#D8E1D5", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 19 }, privacyCard: { backgroundColor: "#E7D9C6", flexWrap: "wrap" }, privacyVisual: { width: "100%", height: 88, borderRadius: 16, marginBottom: 12 }, reminderCopy: { flex: 1 }, reminderTitle: { color: "#2B1D2F", fontSize: 15, fontWeight: "700" }, reminderBody: { color: "#5F4A5E", fontSize: 13, marginTop: 4 }, history: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 17, paddingVertical: 12, alignItems: "center", marginTop: 16 }, historyText: { color: "#5F4A5E", fontSize: 13, fontWeight: "700" }, historyHint: { color: "#9C8D99", fontSize: 11, marginTop: 3 }, feedbackReset: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 17, paddingVertical: 12, alignItems: "center", marginTop: 16 }, feedbackResetText: { color: "#5F4A5E", fontSize: 13, fontWeight: "700" }, feedbackResetHint: { color: "#9C8D99", fontSize: 11, marginTop: 3 }, reset: { borderColor: "#E5D8D4", borderWidth: 1, borderRadius: 17, paddingVertical: 12, alignItems: "center", marginTop: 16 }, resetText: { color: "#B96861", fontSize: 13, fontWeight: "700" }, resetHint: { color: "#9C8D99", fontSize: 11, marginTop: 3 }, save: { backgroundColor: theme.ink, borderRadius: radii.lg, paddingVertical: spacing.lg, alignItems: "center", marginTop: 18 }, saveDisabled: { opacity: 0.45 }, disabled: { opacity: 0.55 }, saveText: { color: theme.canvas, fontSize: typography.button.fontSize, lineHeight: typography.button.lineHeight, fontWeight: "700" }, note: { color: "#9C8D99", textAlign: "center", fontSize: 12, paddingVertical: 15 }, pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] }, });
}
