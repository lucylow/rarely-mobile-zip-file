import { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { FadeInView } from "@/components/ui/fade-in-view";
import { onboardingProgress, transition, type OnboardingState } from "@/lib/ux/onboardingMachine";
import { scorePreferences, starterPath, type Preferences } from "@/lib/ux/onboardingPersonalization";

const ONBOARDING_STORAGE_TIMEOUT_MS = 6000;

function withOnboardingTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), ONBOARDING_STORAGE_TIMEOUT_MS)),
  ]);
}

const interests: { key: keyof Omit<Preferences, "notifications" | "quietHours">; label: string; icon: string }[] = [
  { key: "creativity", label: "Creative ideas", icon: "✦" },
  { key: "journaling", label: "Journaling", icon: "✍︎" },
  { key: "music", label: "Music discovery", icon: "♫" },
  { key: "community", label: "Positive community", icon: "♡" },
  { key: "beauty", label: "Beauty rituals", icon: "◒" },
];

export default function OnboardingScreen() {
  const [state, setState] = useState<OnboardingState>("welcome");
  const [preferences, setPreferences] = useState<Preferences>(() => scorePreferences({}));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const progress = useMemo(() => onboardingProgress(state), [state]);
  const selectedInterests = useMemo(() => interests.filter((item) => preferences[item.key] > 0.7), [preferences]);
  const leadInterest = selectedInterests[0]?.label ?? "small moments";
  const progressLabel = state === "welcome" ? "Welcome" : state === "intent" ? "Choose your intentions" : state === "permissions" ? "Set optional reminders" : "Review your starter path";

  const next = () => setState((current) => transition(current, { type: "NEXT" }));
  const skip = async () => {
    if (isSubmitting) return;
    setFeedback(null);
    setIsSubmitting(true);
    try {
      await withOnboardingTimeout(AsyncStorage.setItem("rarely.onboarding.completed", "true"), "Saving onboarding took too long. Please try again.");
      router.replace("/(tabs)");
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not save your onboarding progress right now. Please try again.";
      setFeedback(message);
      Alert.alert("Could not skip onboarding", message);
    } finally {
      setIsSubmitting(false);
    }
  };
  const finish = async () => {
    if (isSubmitting) return;
    setFeedback(null);
    setIsSubmitting(true);
    const scored = scorePreferences(preferences);
    try {
      await withOnboardingTimeout(AsyncStorage.multiSet([
        ["rarely.onboarding.completed", "true"],
        ["rarely.preferences", JSON.stringify(scored)],
        ["rarely.starterPath", JSON.stringify(starterPath(scored))],
      ]), "Saving your starter path took too long. Please try again.");
      router.replace("/(tabs)");
    } catch (error) {
      const message = error instanceof Error ? error.message : "We could not save your setup yet. Please try again in a moment.";
      setFeedback(message);
      Alert.alert("Could not finish onboarding", message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-5">
      <View style={styles.top}><Text style={styles.eyebrow}>RARELY</Text><Pressable accessibilityRole="button" accessibilityLabel="Skip onboarding" accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting} onPress={skip}><Text style={[styles.skip, isSubmitting && styles.skipDisabled]}>Skip</Text></Pressable></View>
      <View accessibilityRole="progressbar" accessibilityLabel={`${progressLabel}, step ${Math.round(progress * 4)} of 4`} style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress * 100}%` }]} /></View>
      <View style={styles.body}>
        <FadeInView key={state} duration={260} distance={8} style={styles.step}>
        {state === "welcome" && <View><Image source={{ uri: "/manus-storage/rarely-profile-reflection_7bbb06d5.png" }} resizeMode="cover" accessibilityLabel="Reflective welcome visual" style={styles.heroVisual} /><Text style={styles.moon}>☾</Text><Text style={styles.title}>A softer place to become more you.</Text><Text style={styles.subtitle}>A private creative space for small rituals, honest reflection, and positive connection.</Text><Pressable accessibilityRole="button" accessibilityLabel="Begin onboarding" onPress={next} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Let’s begin</Text><Text style={styles.arrow}>→</Text></Pressable></View>}
        {state === "intent" && <View><Text style={styles.kicker}>START WITH YOUR INTENTION</Text><Text style={styles.title}>What would you like more of?</Text><Text style={styles.subtitle}>Choose one or more. You can change this anytime; there is no perfect path.</Text><View accessibilityRole="radiogroup" accessibilityLabel="Intentions" style={styles.interests}>{interests.map((item) => { const selected = preferences[item.key] > 0.7; return <Pressable key={item.key} accessibilityRole="checkbox" accessibilityLabel={item.label} accessibilityState={{ checked: selected }} onPress={() => setPreferences((current) => ({ ...current, [item.key]: selected ? 0.5 : 1 }))} style={({ pressed }) => [styles.interest, selected && styles.interestSelected, pressed && styles.pressed]}><Text style={styles.interestIcon}>{item.icon}</Text><Text style={[styles.interestText, selected && styles.interestTextSelected]}>{item.label}</Text><Text accessibilityLabel={selected ? "Selected" : "Not selected"} style={[styles.checkmark, selected && styles.checkmarkVisible]}>{selected ? "✓" : ""}</Text></Pressable>; })}</View><Text accessibilityLiveRegion="polite" style={styles.selectionHint}>{selectedInterests.length ? `${selectedInterests.length} selected · starting with ${leadInterest}` : "Nothing selected yet · you can continue at your own pace"}</Text><Pressable accessibilityRole="button" accessibilityLabel="Continue to optional reminders" onPress={next} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Continue</Text><Text style={styles.arrow}>→</Text></Pressable></View>}
        {state === "permissions" && <View><Image source={{ uri: "/manus-storage/rarely-preferences-privacy_68d368dc.png" }} resizeMode="cover" accessibilityLabel="Local privacy visual" style={styles.heroVisual} /><Text style={styles.moon}>♡</Text><Text style={styles.title}>Your space stays yours.</Text><Text style={styles.subtitle}>RARELY starts local-first. You can use the core experience without an account, and optional reminders stay off until you choose them.</Text><View style={styles.permissionCard}><View><Text style={styles.permissionTitle}>Gentle reminders</Text><Text style={styles.permissionBody}>Occasional prompts for your Rare Moments.</Text></View><Switch value={preferences.notifications} onValueChange={(value) => setPreferences((current) => ({ ...current, notifications: value }))} trackColor={{ false: "#EDE4E0", true: "#E96F61" }} /></View><Pressable accessibilityRole="button" accessibilityLabel="Continue to your starter path" onPress={next} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Continue</Text><Text style={styles.arrow}>→</Text></Pressable></View>}
        {state === "personalize" && <View><Text style={styles.kicker}>YOUR STARTER PATH</Text><Text style={styles.title}>A little direction, never a rule.</Text><Text style={styles.subtitle}>We’ll shape your first visit around the things you selected.</Text><View style={styles.pathCard}><Text style={styles.pathIcon}>✦</Text><Text style={styles.pathTitle}>{selectedInterests.length ? `A place for ${leadInterest.toLowerCase()}` : "Made for your pace"}</Text><Text style={styles.pathBody}>{selectedInterests.length ? `Your first suggestions will make room for ${selectedInterests.map((item) => item.label.toLowerCase()).join(", ")}. Explore freely and follow what feels useful.` : "You can explore Home, Create, Community, and Rare Studio whenever you want."}</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Enter Rarely" accessibilityState={{ disabled: isSubmitting }} disabled={isSubmitting} onPress={finish} style={[styles.primary, isSubmitting && styles.primaryDisabled]}><Text style={styles.primaryText}>Enter RARELY</Text><Text style={styles.arrow}>→</Text></Pressable></View>}
        </FadeInView>
      </View>
      {feedback ? <Text accessibilityRole="alert" accessibilityLiveRegion="assertive" style={styles.errorFeedback}>{feedback} Your selections remain on this screen; try the action again.</Text> : null}
      <Text style={styles.footer}>Less comparison. More you.</Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, eyebrow: { color: "#E96F61", fontSize: 12, fontWeight: "800", letterSpacing: 3 }, skip: { color: "#7E6F7D", fontSize: 14, fontWeight: "600" }, skipDisabled: { opacity: 0.45 }, progressTrack: { height: 4, backgroundColor: "#EDE4E0", borderRadius: 2, marginTop: 18 }, progressFill: { height: 4, backgroundColor: "#E96F61", borderRadius: 2 }, body: { flex: 1, justifyContent: "center" }, step: { width: "100%" }, heroVisual: { width: "100%", height: 140, borderRadius: 22, marginBottom: 20 }, moon: { color: "#E96F61", fontSize: 44, marginBottom: 20 }, kicker: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 1.7, marginBottom: 15 }, title: { color: "#2B1D2F", fontSize: 34, lineHeight: 39, fontWeight: "700" }, subtitle: { color: "#7E6F7D", fontSize: 16, lineHeight: 23, marginTop: 14 }, primary: { backgroundColor: "#2B1D2F", borderRadius: 18, padding: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 28 }, primaryDisabled: { opacity: 0.55 }, primaryText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" }, arrow: { color: "#FFF7F2", fontSize: 21 }, interests: { gap: 10, marginTop: 22 }, interest: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 17, padding: 14, flexDirection: "row", alignItems: "center", gap: 12 }, interestSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" }, interestIcon: { color: "#E96F61", fontSize: 20 }, interestText: { color: "#2B1D2F", fontSize: 14, fontWeight: "600" }, interestTextSelected: { color: "#FFF7F2" }, checkmark: { marginLeft: "auto", width: 20, color: "transparent", fontSize: 16, fontWeight: "800", textAlign: "center" }, checkmarkVisible: { color: "#FFF7F2" }, selectionHint: { color: "#7E6F7D", fontSize: 13, lineHeight: 19, marginTop: 12 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] }, permissionCard: { marginTop: 24, backgroundColor: "#D8E1D5", borderRadius: 20, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, permissionTitle: { color: "#2B1D2F", fontSize: 15, fontWeight: "700" }, permissionBody: { color: "#5F4A5E", fontSize: 13, marginTop: 4, maxWidth: 230 }, pathCard: { backgroundColor: "#F5D7CF", borderRadius: 23, padding: 20, marginTop: 24 }, pathIcon: { color: "#2B1D2F", fontSize: 28 }, pathTitle: { color: "#2B1D2F", fontSize: 20, fontWeight: "700", marginTop: 14 }, pathBody: { color: "#5F4A5E", fontSize: 14, lineHeight: 20, marginTop: 6 }, errorFeedback: { color: "#8E3030", backgroundColor: "#FCE8E6", borderRadius: 14, padding: 12, fontSize: 13, lineHeight: 19, marginTop: 10 }, footer: { color: "#9C8D99", textAlign: "center", fontSize: 12, paddingBottom: 12 }, });
