import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { Snackbar } from "@/components/ui/snackbar";
import { normalizedParamOr, runGuarded } from "@/lib/ux/guards";
import { parseActivityRecords } from "@/lib/ux/localStorage";
import { triggerSuccessNotification } from "@/lib/ux/haptics";

export default function CircleScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; title?: string | string[]; prompt?: string | string[] }>();
  const id = normalizedParamOr(params.id, "circle");
  const title = normalizedParamOr(params.title, "A thoughtful circle");
  const prompt = normalizedParamOr(params.prompt, "What are you curious about this week?");
  const [joined, setJoined] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [canUndoLeave, setCanUndoLeave] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    let active = true;
    void runGuarded(
      () => AsyncStorage.getItem("rarely.joinedCircles"),
      () => {
        if (!active) return;
        setSnackbar("Could not load circle status");
      },
    ).then((value) => {
      if (!active || value === undefined) return;
      setJoined(parseActivityRecords(value).some((item) => item.id === id));
    });
    return () => {
      active = false;
    };
  }, [id]);
  const toggleJoin = async () => {
    if (submitting) return;
    setSubmitting(true);
    const saved = await runGuarded(async () => {
      const value = await AsyncStorage.getItem("rarely.joinedCircles");
      const current = parseActivityRecords(value);
      const next = joined ? current.filter((item) => item.id !== id) : [...current.filter((item) => item.id !== id), { id, name: title, joinedAt: new Date().toISOString() }];
      await AsyncStorage.setItem("rarely.joinedCircles", JSON.stringify(next));
    }, () => setSnackbar(joined ? `Could not leave ${title}` : `Could not join ${title}`));
    if (saved === undefined) {
      setSubmitting(false);
      return;
    }
    setJoined(!joined);
    await triggerSuccessNotification();
    setCanUndoLeave(joined);
    setSnackbar(joined ? `You left ${title}` : `You joined ${title}`);
    setSubmitting(false);
  };
  const undoLeave = async () => {
    if (!canUndoLeave || submitting) return;
    setSubmitting(true);
    const restored = await runGuarded(async () => {
      const value = await AsyncStorage.getItem("rarely.joinedCircles");
      const current = parseActivityRecords(value);
      await AsyncStorage.setItem("rarely.joinedCircles", JSON.stringify([...current.filter((item) => item.id !== id), { id, name: title, joinedAt: new Date().toISOString() }]));
    }, () => setSnackbar(`Could not restore ${title}`));
    if (restored === undefined) {
      setSubmitting(false);
      return;
    }
    setJoined(true);
    setCanUndoLeave(false);
    setSnackbar(`${title} restored`);
    setSubmitting(false);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
      <View style={styles.hero}><Image source={{ uri: "/manus-storage/rarely-community-circle_4172fac0.png" }} resizeMode="cover" accessibilityLabel="Community circle visual" style={styles.heroVisual} /><Text style={styles.heart}>♡</Text><Text style={styles.kicker}>COMMUNITY CIRCLE</Text><Text style={styles.title}>{title}</Text><Text style={styles.body}>{prompt}</Text></View>
      <View style={styles.rule}><Text style={styles.ruleTitle}>A kinder way to connect.</Text><Text style={styles.ruleBody}>Share what feels true, leave room for other people’s pace, and keep personal details private.</Text></View>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: joined, disabled: submitting }} accessibilityLabel={joined ? `Leave ${title}` : `Join ${title}`} disabled={submitting} onPress={toggleJoin} style={[styles.primary, submitting && styles.primaryDisabled]}><Text style={styles.primaryText}>{submitting ? "Saving…" : joined ? "Joined circle ✓" : "Join this circle"}</Text></Pressable>
      <Snackbar message={snackbar} actionLabel={canUndoLeave ? "Undo" : undefined} onAction={canUndoLeave ? undoLeave : undefined} onDismiss={() => { setSnackbar(null); setCanUndoLeave(false); }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 }, hero: { backgroundColor: "#D9CDE7", borderRadius: 25, padding: 22, marginTop: 22, overflow: "hidden" }, heroVisual: { width: "100%", height: 120, borderRadius: 19, marginBottom: 3 }, heart: { color: "#E96F61", fontSize: 30 }, kicker: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 18 }, title: { color: "#2B1D2F", fontSize: 29, lineHeight: 35, fontWeight: "700", marginTop: 10 }, body: { color: "#5F4A5E", fontSize: 16, lineHeight: 23, marginTop: 10 }, rule: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 20, padding: 17, marginTop: 14 }, ruleTitle: { color: "#2B1D2F", fontSize: 16, fontWeight: "700" }, ruleBody: { color: "#7E6F7D", fontSize: 13, lineHeight: 19, marginTop: 5 }, primary: { backgroundColor: "#2B1D2F", borderRadius: 18, padding: 17, alignItems: "center", marginTop: "auto", marginBottom: 14 }, primaryDisabled: { opacity: 0.7 }, primaryText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" }, });
