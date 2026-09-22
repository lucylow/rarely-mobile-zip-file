import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { Snackbar } from "@/components/ui/snackbar";
import { normalizedParamOr, runGuarded } from "@/lib/ux/guards";
import { parseActivityRecords } from "@/lib/ux/localStorage";
import { triggerSuccessNotification } from "@/lib/ux/haptics";

export default function RoutineScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; title?: string | string[]; body?: string | string[]; steps?: string | string[] }>();
  const id = normalizedParamOr(params.id, "routine");
  const title = normalizedParamOr(params.title, "A gentle routine");
  const body = normalizedParamOr(params.body, "A small ritual to return to yourself.");
  const steps = normalizedParamOr(params.steps, "Pause|Notice|Keep one small thing");
  const routineSteps = steps.split("|").map((step) => step.trim()).filter(Boolean);
  const [completed, setCompleted] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [canUndoIncomplete, setCanUndoIncomplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    let active = true;
    void runGuarded(
      () => AsyncStorage.getItem("rarely.completedRoutines"),
      () => {
        if (!active) return;
        setSnackbar("Could not load routine status");
      },
    ).then((value) => {
      if (!active || value === undefined) return;
      setCompleted(parseActivityRecords(value).some((item) => item.id === id));
    });
    return () => {
      active = false;
    };
  }, [id]);
  const finish = async () => {
    if (submitting) return;
    setSubmitting(true);
    const saved = await runGuarded(async () => {
      const value = await AsyncStorage.getItem("rarely.completedRoutines");
      const current = parseActivityRecords(value);
      const next = completed ? current.filter((item) => item.id !== id) : [...current.filter((item) => item.id !== id), { id, name: title, completedAt: new Date().toISOString() }];
      await AsyncStorage.setItem("rarely.completedRoutines", JSON.stringify(next));
    }, () => setSnackbar(completed ? `Could not update ${title}` : `Could not complete ${title}`));
    if (saved === undefined) {
      setSubmitting(false);
      return;
    }
    setCompleted(!completed);
    await triggerSuccessNotification();
    setCanUndoIncomplete(completed);
    setSnackbar(completed ? `${title} marked incomplete` : `${title} completed`);
    setSubmitting(false);
  };
  const undoIncomplete = async () => {
    if (!canUndoIncomplete || submitting) return;
    setSubmitting(true);
    const restored = await runGuarded(async () => {
      const value = await AsyncStorage.getItem("rarely.completedRoutines");
      const current = parseActivityRecords(value);
      await AsyncStorage.setItem("rarely.completedRoutines", JSON.stringify([...current.filter((item) => item.id !== id), { id, name: title, completedAt: new Date().toISOString() }]));
    }, () => setSnackbar(`Could not restore ${title}`));
    if (restored === undefined) {
      setSubmitting(false);
      return;
    }
    setCompleted(true);
    setCanUndoIncomplete(false);
    setSnackbar(`${title} restored as completed`);
    setSubmitting(false);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable>
      <View style={styles.hero}><Image source={{ uri: "/manus-storage/rarely-studio-making_74b6fbec.png" }} resizeMode="cover" accessibilityLabel="Rare Studio routine visual" style={styles.heroVisual} /><Text style={styles.icon}>◒</Text><Text style={styles.kicker}>RARE STUDIO</Text><Text style={styles.title}>{title}</Text><Text style={styles.body}>{body}</Text></View>
      <Text style={styles.section}>Your ritual</Text>
      <View style={styles.steps}>{routineSteps.map((step, index) => <View key={step} style={styles.step}><View style={styles.number}><Text style={styles.numberText}>{index + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>)}</View>
      <Pressable accessibilityRole="button" accessibilityState={{ selected: completed, disabled: submitting }} accessibilityLabel={completed ? `Mark ${title} as incomplete` : `Mark ${title} complete`} disabled={submitting} onPress={finish} style={[styles.primary, submitting && styles.primaryDisabled]}><Text style={styles.primaryText}>{submitting ? "Saving…" : completed ? "Completed ✓" : "Mark routine complete"}</Text></Pressable>
      <Snackbar message={snackbar} actionLabel={canUndoIncomplete ? "Undo" : undefined} onAction={canUndoIncomplete ? undoIncomplete : undefined} onDismiss={() => { setSnackbar(null); setCanUndoIncomplete(false); }} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 }, hero: { backgroundColor: "#F5D7CF", borderRadius: 25, padding: 22, marginTop: 22, overflow: "hidden" }, heroVisual: { width: "100%", height: 120, borderRadius: 19, marginBottom: 3 }, icon: { color: "#E96F61", fontSize: 31 }, kicker: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 18 }, title: { color: "#2B1D2F", fontSize: 29, lineHeight: 35, fontWeight: "700", marginTop: 10 }, body: { color: "#5F4A5E", fontSize: 16, lineHeight: 23, marginTop: 10 }, section: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 25 }, steps: { gap: 11, marginTop: 14 }, step: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#FFFFFF", borderRadius: 17, padding: 13 }, number: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#F8E3A8", alignItems: "center", justifyContent: "center" }, numberText: { color: "#2B1D2F", fontSize: 11, fontWeight: "800" }, stepText: { color: "#2B1D2F", fontSize: 14, flex: 1 }, primary: { backgroundColor: "#2B1D2F", borderRadius: 18, padding: 17, alignItems: "center", marginTop: "auto", marginBottom: 14 }, primaryDisabled: { opacity: 0.7 }, primaryText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" }, });
