import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { Snackbar } from "@/components/ui/snackbar";
import { scorePreferences } from "@/lib/ux/onboardingPersonalization";
import {
  applyRecommendationFeedback,
  buildPersonalizationProfile,
  isRecommendationExploring,
  rankRoutines,
  recommendationKey,
  selectedFeedbackKind,
  summarizeRecommendationFeedback,
  timeAwarePrompt,
  type PersonalizationProfile,
  type RecommendationFeedback,
} from "@/lib/ux/personalization";
import {
  canShowUpgradePrompt,
  isPremiumActive,
  loadMonetizationPromptState,
  loadMonetizationState,
  recordUpgradePromptShown,
} from "@/lib/ux/monetization";
import { appendPersonalizationHistory, loadRecommendationFeedback, saveRecommendationFeedback } from "@/lib/ux/localStorage";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { reportNonFatalError } from "@/lib/non-fatal-error";
import { safeJsonParse } from "@/lib/utils";
import { triggerLightImpact } from "@/lib/ux/haptics";
import { loadLocalActivitySnapshot } from "@/lib/ux/localActivity";

const routines = [
  {
    id: "soft",
    title: "Soft focus",
    body: "A five-minute routine for days that call for less, not more.",
    tag: "5 MIN",
    color: "#F5D7CF",
    icon: "◒",
  },
  {
    id: "color",
    title: "Color play",
    body: "Choose one shade and let it become the whole mood.",
    tag: "CREATIVE",
    color: "#D9CDE7",
    icon: "✦",
  },
  {
    id: "reset",
    title: "The reset",
    body: "A simple wind-down ritual to help you return to yourself.",
    tag: "EVENING",
    color: "#D8E1D5",
    icon: "☾",
  },
];

const FEATURED_ROUTINE_ID = "soft";

export default function StudioScreen() {
  const [profile, setProfile] = useState<PersonalizationProfile>(() =>
    buildPersonalizationProfile(scorePreferences({}), {
      journalCount: 0,
      momentCount: 0,
      circleCount: 0,
      routineCount: 0,
    }),
  );
  const [orderedRoutines, setOrderedRoutines] = useState(routines);
  const [feedback, setFeedback] = useState<RecommendationFeedback>({});
  const [premiumActive, setPremiumActive] = useState(false);
  const [lockedPromptAvailable, setLockedPromptAvailable] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [unavailableActivityKeys, setUnavailableActivityKeys] = useState<string[]>([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

  useAsyncFocusEffect(async (isActive) => {
    try {
      const [preferencesValue, activity, feedbackValue, monetizationState, promptState] = await Promise.all([
        AsyncStorage.getItem("rarely.preferences"),
        loadLocalActivitySnapshot(),
        loadRecommendationFeedback(),
        loadMonetizationState(AsyncStorage),
        loadMonetizationPromptState(AsyncStorage),
      ]);
      if (!isActive()) return;
      setUnavailableActivityKeys(activity.unavailableKeys);
      setIsUsingFallback(false);

      const preferences = scorePreferences(safeJsonParse(preferencesValue, {}));
      const completedCount = activity.routines.length;
      const nextFeedback = feedbackValue;
      const nextProfile = buildPersonalizationProfile(preferences, {
        journalCount: 0,
        momentCount: 0,
        circleCount: 0,
        routineCount: completedCount,
      });
      setProfile(nextProfile);
      setFeedback(nextFeedback);
      setOrderedRoutines(rankRoutines(routines, nextProfile, nextFeedback));
      const premium = isPremiumActive(monetizationState);
      setPremiumActive(premium);
      setLockedPromptAvailable(!premium && canShowUpgradePrompt(promptState));
    } catch (error) {
      reportNonFatalError("studio:load-data", error);
      if (!isActive()) return;
      setOrderedRoutines(routines);
      setProfile(buildPersonalizationProfile(scorePreferences({}), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 }));
      setFeedback({});
      setPremiumActive(false);
      setLockedPromptAvailable(false);
      setIsUsingFallback(true);
      setSnackbar("Studio is using offline routines. Reopen to retry.");
    }
  }, [retryToken]);

  const respond = useCallback(
    async (id: string, kind: "fits" | "dismissed") => {
      const key = recommendationKey("routine", id);
      const timestamp = new Date().toISOString();
      const previous = feedback;
      const next = applyRecommendationFeedback(feedback, key, kind, timestamp);
      setFeedback(next);
      setOrderedRoutines(rankRoutines(routines, profile, next));
      try {
        await saveRecommendationFeedback(next);
        await appendPersonalizationHistory({ kind: "recommendation", value: `${kind}:routine:${id}`, at: timestamp });
      } catch (error) {
        reportNonFatalError("studio:save-recommendation-feedback", error, { routineId: id, kind });
        setFeedback(previous);
        setOrderedRoutines(rankRoutines(routines, profile, previous));
        setSnackbar("Could not save recommendation feedback");
      }
    },
    [feedback, profile],
  );

  const openRoutine = useCallback(
    async (id: string, title: string, body: string, isLocked: boolean) => {
      try {
        await triggerLightImpact();
        if (isLocked && !premiumActive) {
          if (lockedPromptAvailable) {
            try {
              await recordUpgradePromptShown(AsyncStorage, `studio_routine_${id}`);
            } catch (error) {
              reportNonFatalError("studio:record-upgrade-prompt", error, { routineId: id });
            }
            setLockedPromptAvailable(false);
          }
          setSnackbar("Featured routines are unlocked with Rarely Plus.");
          router.push({ pathname: "/membership", params: { source: `studio_routine_${id}` } } as never);
          return;
        }
        router.push({
          pathname: "/routine",
          params: { id, title, body, steps: "Pause|Notice|Keep one small thing" },
        });
      } catch (error) {
        reportNonFatalError("studio:open-routine", error, { routineId: id });
        setSnackbar("Could not open this routine right now");
      }
    },
    [lockedPromptAvailable, premiumActive],
  );

  return (
    <ScreenContainer className="px-5 pt-5">
      <FlatList
        data={orderedRoutines}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>RARE STUDIO</Text>
            <Text style={styles.title}>Beauty as a creative ritual.</Text>
            <Text style={styles.subtitle}>Discover routines that invite experimentation instead of perfection.</Text>
            {isUsingFallback ? <View style={styles.recovery}><Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.subtitle}>Offline routines are shown for now. Your private activity was not used.</Text><Pressable accessibilityRole="button" accessibilityLabel="Retry loading Studio routines" onPress={() => setRetryToken((value) => value + 1)} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}><Text style={styles.retryText}>Retry</Text></Pressable></View> : null}
            {unavailableActivityKeys.length > 0 ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.subtitle}>Some local activity signals are temporarily unavailable. Reopen this screen to try again.</Text> : null}
            <View accessibilityLiveRegion="polite" style={styles.personalized}>
              <Text style={styles.personalizedLabel}>
                A SMALL RITUAL FOR THIS {timeAwarePrompt(profile).split(" for ")[0].toUpperCase()}
              </Text>
              <Text style={styles.personalizedText}>{timeAwarePrompt(profile)}</Text>
            </View>
            {!premiumActive ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Unlock Rarely Plus studio rituals"
                onPress={() => router.push({ pathname: "/membership", params: { source: "studio_header" } } as never)}
                style={({ pressed }) => [styles.plusCard, pressed && styles.pressed]}
              >
                <Text style={styles.plusKicker}>RARELY PLUS</Text>
                <Text style={styles.plusTitle}>Unlock featured studio rituals</Text>
                <Text style={styles.plusBody}>Get premium routines, exclusive drops, and early access to guided product scans.</Text>
                <Text style={styles.plusAction}>View plans →</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Scan a product to learn, try, and save what you already love"
              onPress={() => {
                void triggerLightImpact();
                setSnackbar("Product scan is coming soon. Try a routine for now.");
              }}
              style={styles.scan}
            >
              <View style={styles.scanIcon}>
                <Text style={styles.scanIconText}>⌁</Text>
              </View>
              <View style={styles.scanCopy}>
                <Text style={styles.scanTitle}>Scan a product</Text>
                <Text style={styles.scanBody}>Learn, try, and save what you already love.</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
            <Text style={styles.section}>Try a routine</Text>
          </View>
        }
        renderItem={({ item }) => {
          const key = recommendationKey("routine", item.id);
          const summary = summarizeRecommendationFeedback(feedback, key);
          const exploring = isRecommendationExploring(feedback, key);
          const selectedFeedback = selectedFeedbackKind(feedback, key);
          const isLocked = item.id === FEATURED_ROUTINE_ID;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title} routine. ${item.body}`}
              onPress={() => void openRoutine(item.id, item.title, item.body, isLocked)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: item.color },
                isLocked && !premiumActive && styles.lockedCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardTop}>
                <View style={styles.icon}>
                  <Text style={styles.iconText}>{item.icon}</Text>
                </View>
                <View style={styles.cardTopRight}>
                  <Text style={styles.tag}>{item.tag}</Text>
                  {isLocked ? <Text style={styles.lockBadge}>{premiumActive ? "PLUS" : "PLUS LOCKED"}</Text> : null}
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardBody}>{item.body}</Text>
              <Text
                accessibilityLabel={`Why this routine is recommended: ${profile.topInterestKey === "beauty" && item.id === "soft" ? "it matches your interest in beauty rituals" : profile.topInterestKey === "creativity" && item.id === "color" ? "it matches your interest in creative ideas" : "it offers a gentle way to make space"}`}
                style={styles.why}
              >
                Why this fits:{" "}
                {profile.topInterestKey === "beauty" && item.id === "soft"
                  ? "your interest in beauty rituals"
                  : profile.topInterestKey === "creativity" && item.id === "color"
                    ? "your interest in creative ideas"
                    : "a gentle way to make space"}
                {exploring ? " · still learning your routine style" : ""}
              </Text>
              {exploring ? <Text style={styles.explorationChip}>Exploring new options for you</Text> : null}
              <View style={styles.feedbackRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`This routine fits: ${item.title}`}
                  onPress={(event) => {
                    event.stopPropagation();
                    if (selectedFeedback !== "fits") {
                      void respond(item.id, "fits");
                    }
                  }}
                  style={[styles.feedbackButton, selectedFeedback === "fits" && styles.feedbackSelected]}
                >
                  <Text style={styles.feedbackText}>
                    {selectedFeedback === "fits" ? (summary.confidence === "high" ? "Strong fit ✓" : "Fits ✓") : "This fits"}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`This routine is not for me: ${item.title}`}
                  onPress={(event) => {
                    event.stopPropagation();
                    if (selectedFeedback !== "dismissed") {
                      void respond(item.id, "dismissed");
                    }
                  }}
                  style={[styles.feedbackButton, selectedFeedback === "dismissed" && styles.feedbackSelected]}
                >
                  <Text style={styles.feedbackText}>{selectedFeedback === "dismissed" ? "Noted ✓" : "Not for me"}</Text>
                </Pressable>
              </View>
              <Text style={styles.explore}>{isLocked && !premiumActive ? "Unlock with Rarely Plus  →" : "Explore  →"}</Text>
            </Pressable>
          );
        }}
      />
      <Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} bottomOffset={72} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30, gap: 12 },
  eyebrow: { color: "#E96F61", fontSize: 12, fontWeight: "800", letterSpacing: 2.4 },
  title: { color: "#2B1D2F", fontSize: 32, lineHeight: 37, fontWeight: "700", marginTop: 10 },
  subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 21, marginTop: 10 },
  personalized: {
    backgroundColor: "#FFF7F2",
    borderColor: "#EDE4E0",
    borderWidth: 1,
    borderRadius: 18,
    padding: 13,
    marginTop: 18,
  },
  personalizedLabel: { color: "#E96F61", fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  personalizedText: { color: "#5F4A5E", fontSize: 13, lineHeight: 18, marginTop: 5 },
  recovery: { marginTop: 4 }, retry: { alignSelf: "flex-start", backgroundColor: "#2B1D2F", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8 }, retryText: { color: "#FFF7F2", fontSize: 12, fontWeight: "700" }, plusCard: { backgroundColor: "#2B1D2F", borderRadius: 18, padding: 14, marginTop: 16 },
  plusKicker: { color: "#F28A7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  plusTitle: { color: "#FFF7F2", fontSize: 16, fontWeight: "700", marginTop: 6 },
  plusBody: { color: "#D6C8D3", fontSize: 12, lineHeight: 17, marginTop: 4 },
  plusAction: { color: "#FFF7F2", fontSize: 12, fontWeight: "700", marginTop: 9 },
  scan: {
    borderColor: "#EDE4E0",
    borderWidth: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 22,
  },
  scanIcon: {
    width: 43,
    height: 43,
    borderRadius: 15,
    backgroundColor: "#2B1D2F",
    alignItems: "center",
    justifyContent: "center",
  },
  scanIconText: { color: "#FFF7F2", fontSize: 24 },
  scanCopy: { flex: 1 },
  scanTitle: { color: "#2B1D2F", fontSize: 15, fontWeight: "700" },
  scanBody: { color: "#7E6F7D", fontSize: 12, marginTop: 3 },
  arrow: { color: "#2B1D2F", fontSize: 20 },
  section: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 27, marginBottom: 2 },
  card: { borderRadius: 24, padding: 18 },
  lockedCard: { borderWidth: 1, borderColor: "rgba(43,29,47,0.15)" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.62)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { color: "#2B1D2F", fontSize: 22 },
  cardTopRight: { alignItems: "flex-end", gap: 5 },
  tag: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.1 },
  lockBadge: {
    color: "#2B1D2F",
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    backgroundColor: "rgba(255,255,255,0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  cardTitle: { color: "#2B1D2F", fontSize: 21, fontWeight: "700", marginTop: 17 },
  cardBody: { color: "#5F4A5E", fontSize: 14, lineHeight: 20, marginTop: 6 },
  why: { color: "#7E6F7D", fontSize: 11, lineHeight: 16, marginTop: 10, fontWeight: "700" },
  explorationChip: { color: "#5F4A5E", fontSize: 10, fontWeight: "700", marginTop: 5 },
  feedbackRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  feedbackButton: {
    borderColor: "rgba(43,29,47,0.18)",
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 44,
    paddingHorizontal: 11,
    paddingVertical: 10,
    justifyContent: "center",
  },
  feedbackSelected: { backgroundColor: "rgba(255,255,255,0.7)" },
  feedbackText: { color: "#5F4A5E", fontSize: 11, fontWeight: "700" },
  explore: { color: "#2B1D2F", fontSize: 13, fontWeight: "700", marginTop: 19 },
});
