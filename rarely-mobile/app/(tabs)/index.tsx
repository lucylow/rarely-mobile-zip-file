import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { router } from "expo-router";
import { AccessibilityInfo, Animated, Easing, FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { scorePreferences } from "@/lib/ux/onboardingPersonalization";
import { applyRecommendationFeedback, buildPersonalizationProfile, isRecommendationExploring, personalizedRationale, rankMoodOptions, recommendationKey, selectedFeedbackKind, summarizeRecommendationFeedback, type PersonalizationProfile } from "@/lib/ux/personalization";
import { canShowUpgradePrompt, isPremiumActive, loadMonetizationPromptState, loadMonetizationState, recordUpgradePromptShown, shouldTriggerUsageUpsell } from "@/lib/ux/monetization";
import { ScreenContainer } from "@/components/screen-container";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Snackbar } from "@/components/ui/snackbar";
import { appendPersonalizationHistory, loadRecommendationFeedback, saveRecommendationFeedback } from "@/lib/ux/localStorage";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { reportNonFatalError, withNonFatal } from "@/lib/non-fatal-error";
import { safeJsonParse } from "@/lib/utils";
import { loadLocalActivitySnapshot } from "@/lib/ux/localActivity";
import { triggerLightImpact } from "@/lib/ux/haptics";
import { getMotionDuration } from "@/lib/ux/motion";

const moodVisuals: Record<string, string> = {
  happy: "/manus-storage/rarely-mood-energy_9076cfbb.png",
  stressed: "/manus-storage/rarely-mood-calm_afcc209c.png",
  creative: "/manus-storage/rarely-mood-creative_c6771dad.png",
  tired: "/manus-storage/rarely-mood-calm_afcc209c.png",
  excited: "/manus-storage/rarely-mood-energy_9076cfbb.png",
  vibing: "/manus-storage/rarely-mood-reflective_2709022d.png",
};
const DEFAULT_MOOD = "creative";

const moods = [
  { id: "happy", label: "Happy", emoji: "☀️", tint: "#F8E3A8" },
  { id: "stressed", label: "Stressed", emoji: "🌧️", tint: "#D9CDE7" },
  { id: "creative", label: "Creative", emoji: "✨", tint: "#F5D7CF" },
  { id: "tired", label: "Tired", emoji: "🌙", tint: "#D8E1D5" },
  { id: "excited", label: "Excited", emoji: "⚡", tint: "#F6C7B7" },
  { id: "vibing", label: "Just vibing", emoji: "🪩", tint: "#E7D9C6" },
];

const moments: Record<string, { title: string; body: string; steps: string[]; color: string }> = {
  happy: { title: "Keep the glow going", body: "A tiny celebration for the good energy you already have.", steps: ["Save one thing that made you smile", "Make a 30-second joy playlist", "Share a kind note with yourself"], color: "#F8E3A8" },
  stressed: { title: "A softer place to land", body: "Slow down with a gentle reset that asks nothing from you.", steps: ["Take three unhurried breaths", "Write what can wait until tomorrow", "Choose one comforting sound"], color: "#D9CDE7" },
  creative: { title: "Make a little magic", body: "Follow your curiosity for ten minutes and see where it leads.", steps: ["Write a line that starts with ‘I wonder…’", "Take a photo of an interesting color", "Save one idea for later"], color: "#F5D7CF" },
  tired: { title: "Gentle is enough", body: "A low-energy moment for checking in without fixing anything.", steps: ["Name one thing your body needs", "Put your phone down for one minute", "Write one kind sentence to yourself"], color: "#D8E1D5" },
  excited: { title: "Channel the spark", body: "Turn your momentum into one small, satisfying creative action.", steps: ["Choose a tiny idea to start", "Set a ten-minute timer", "Capture what you made"], color: "#F6C7B7" },
  vibing: { title: "Follow the feeling", body: "No agenda. Just a playful pause that belongs entirely to you.", steps: ["Pick a song by its first impression", "Notice three colors around you", "Save a moment worth remembering"], color: "#E7D9C6" },
};

const quickActions = [
  { id: "create", label: "Start creating", emoji: "✦", route: "/create" },
  { id: "community", label: "Join a circle", emoji: "♡", route: "/community" },
  { id: "studio", label: "Try a routine", emoji: "◒", route: "/studio" },
] as const;

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning, you.";
  if (hour < 18) return "Good afternoon, you.";
  return "Good evening, you.";
};

export default function HomeScreen() {
  const [selectedMood, setSelectedMood] = useState(DEFAULT_MOOD);
  const [orderedMoods, setOrderedMoods] = useState(moods);
  const [feedbackStore, setFeedbackStore] = useState<Awaited<ReturnType<typeof loadRecommendationFeedback>>>({});
  const [interestHint, setInterestHint] = useState("your curiosity");
  const [profile, setProfile] = useState<PersonalizationProfile>(() => buildPersonalizationProfile(scorePreferences({}), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 }));
  const [recommendationFeedback, setRecommendationFeedback] = useState<"fits" | "dismissed" | null>(null);
  const [showMore, setShowMore] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showUpgradeCard, setShowUpgradeCard] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [unavailableActivityKeys, setUnavailableActivityKeys] = useState<string[]>([]);
  const [usingLocalStarter, setUsingLocalStarter] = useState(false);
  const moodTransition = useRef(new Animated.Value(1)).current;
  const moodLabels: Record<string, string> = { happy: "happy", stressed: "stressed", creative: "creative", tired: "tired", excited: "energized", vibing: "playful" };
  const moment = useMemo(() => moments[selectedMood], [selectedMood]);
  const rationale = personalizedRationale(profile, moodLabels[selectedMood] ?? "present");
  const moodSummary = summarizeRecommendationFeedback(feedbackStore, recommendationKey("mood", selectedMood));
  const moodIsExploring = isRecommendationExploring(feedbackStore, recommendationKey("mood", selectedMood));
  const greeting = useMemo(() => getGreeting(), []);
  useEffect(() => {
    moodTransition.stopAnimation();
    moodTransition.setValue(reduceMotion ? 1 : 0.96);
    Animated.timing(moodTransition, { toValue: 1, duration: getMotionDuration(reduceMotion, 220), easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [moodTransition, reduceMotion, selectedMood]);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => undefined);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduceMotion);
    return () => subscription.remove();
  }, []);

  const loadHomeData = useCallback(async (isActive: () => boolean) => {
    try {
      const [lastMoodValue, preferencesValue, activity, feedbackValue, monetizationState, promptState] = await Promise.all([
        AsyncStorage.getItem("rarely.lastMood"),
        AsyncStorage.getItem("rarely.preferences"),
        loadLocalActivitySnapshot(),
        loadRecommendationFeedback(),
        loadMonetizationState(AsyncStorage),
        loadMonetizationPromptState(AsyncStorage),
      ]);
      if (!isActive()) return;
      setUnavailableActivityKeys(activity.unavailableKeys);
      setUsingLocalStarter(activity.unavailableKeys.length > 0);

      const nextMood = lastMoodValue && moments[lastMoodValue] ? lastMoodValue : DEFAULT_MOOD;
      if (nextMood !== selectedMood) setSelectedMood(nextMood);

      const preferences = scorePreferences(safeJsonParse(preferencesValue, {}));
      const journalEntries = activity.journal;
      const momentsSaved = activity.moments;
      const circlesJoined = activity.circles;
      const routinesCompleted = activity.routines;
      const feedback = feedbackValue;
      const timestamps = [
        ...journalEntries.map((item) => item.date),
        ...momentsSaved.map((item) => item.completedAt),
        ...circlesJoined.map((item) => item.joinedAt),
        ...routinesCompleted.map((item) => item.completedAt),
      ].filter(Boolean) as string[];
      const nextProfile = buildPersonalizationProfile(preferences, {
        journalCount: journalEntries.length,
        momentCount: momentsSaved.length,
        circleCount: circlesJoined.length,
        routineCount: routinesCompleted.length,
        lastActivityAt: timestamps.sort().at(-1),
      });
      if (!isActive()) return;
      setProfile(nextProfile);
      setInterestHint(nextProfile.topInterestLabel);
      setFeedbackStore(feedback);
      setOrderedMoods(rankMoodOptions(moods, feedback));
    setRecommendationFeedback(selectedFeedbackKind(feedback, recommendationKey("mood", nextMood)));
      const shouldUpsell =
        !isPremiumActive(monetizationState) &&
        shouldTriggerUsageUpsell({
          journalCount: journalEntries.length,
          momentCount: momentsSaved.length,
          circleCount: circlesJoined.length,
          routineCount: routinesCompleted.length,
        }) &&
        canShowUpgradePrompt(promptState);
      setShowUpgradeCard(shouldUpsell);
      if (shouldUpsell) {
        try {
          await recordUpgradePromptShown(AsyncStorage, "home");
        } catch (error) {
          reportNonFatalError("home:record-upgrade-prompt", error);
          // Non-blocking analytics failure.
        }
      }
    } catch (error) {
      reportNonFatalError("home:load-data", error);
      if (isActive()) { setUsingLocalStarter(true); setSnackbar("Unable to refresh Home right now; a private local starter is still available"); }
    }
  }, [selectedMood]);

  useAsyncFocusEffect(loadHomeData, [loadHomeData], () => {
    setSnackbar("We couldn't refresh personalization right now.");
  });

  const bestEffortImpact = useCallback(async (scope: string) => {
    if (reduceMotion) return;
    await withNonFatal(scope, async () => {
      await triggerLightImpact();
      return true;
    });
  }, [reduceMotion]);

  const respondToRecommendation = async (kind: "fits" | "dismissed") => {
    if (recommendationFeedback === kind) return;
    const previousFeedback = recommendationFeedback;
    const previousStore = feedbackStore;
    setRecommendationFeedback(kind);
    const saved = await withNonFatal(
      "home:save-recommendation-feedback",
      async () => {
      const key = recommendationKey("mood", selectedMood);
      const timestamp = new Date().toISOString();
      const feedback = await loadRecommendationFeedback();
      const next = applyRecommendationFeedback(feedback, key, kind, timestamp);
      await saveRecommendationFeedback(next);
      setFeedbackStore(next);
      setOrderedMoods(rankMoodOptions(moods, next));
      await appendPersonalizationHistory({ kind: "recommendation", value: `${kind}:mood:${selectedMood}`, at: timestamp });
      setSnackbar(kind === "fits" ? "Saved: this recommendation fits" : "Saved: we will avoid this suggestion");
      return true;
      },
      { metadata: { mood: selectedMood, kind } },
    );
    if (!saved) {
      setRecommendationFeedback(previousFeedback);
      setFeedbackStore(previousStore);
      setOrderedMoods(rankMoodOptions(moods, previousStore));
      setSnackbar("Could not save recommendation feedback");
    }
  };

  const chooseMood = async (id: string) => {
    setSelectedMood(id);
    setRecommendationFeedback(null);
    const previousFeedback = recommendationFeedback;
    const saved = await withNonFatal(
      "home:choose-mood",
      async () => {
      await AsyncStorage.setItem("rarely.lastMood", id);
      await appendPersonalizationHistory({ kind: "mood", value: id, at: new Date().toISOString() });
      const feedback = await loadRecommendationFeedback();
      setFeedbackStore(feedback);
      setRecommendationFeedback(selectedFeedbackKind(feedback, recommendationKey("mood", id)));
      setSnackbar(`${moods.find((mood) => mood.id === id)?.label ?? "Mood"} selected`);
      return true;
      },
      { metadata: { mood: id } },
    );
    if (!saved) {
      setRecommendationFeedback(previousFeedback);
      setSnackbar("Could not save your mood right now");
    }
    await bestEffortImpact("home:choose-mood-haptic");
  };

  const openQuickAction = async (route: "/create" | "/community" | "/studio") => {
    const opened = await withNonFatal(
      "home:open-quick-action",
      async () => {
      if (!reduceMotion) {
        await triggerLightImpact();
      }
      router.push(route);
      return true;
      },
      { metadata: { route } },
    );
    if (!opened) {
      setSnackbar("Could not open that section right now");
    }
  };

  const startMoment = async () => {
    const opened = await withNonFatal(
      "home:start-moment",
      async () => {
        await bestEffortImpact("home:start-moment-haptic");
        router.push({ pathname: "/moment", params: { mood: selectedMood } });
        return true;
      },
      { metadata: { mood: selectedMood } },
    );
    if (!opened) {
      setSnackbar("Could not start this moment right now");
    }
  };

  const refreshHome = async () => {
    setRefreshing(true);
    try {
      await loadHomeData(() => true);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <ScreenContainer className="px-5 pt-5" containerClassName="bg-background">
      <FlatList
        data={[{ id: "moment" }]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshHome} tintColor="#2B1D2F" colors={["#2B1D2F"]} />}
        ListHeaderComponent={
          <FadeInView duration={320}>

            <View style={styles.topRow}>
              <View>
                <Text style={styles.eyebrow}>RARELY</Text>
                <Text style={styles.greeting}>{greeting}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Open your profile" onPress={() => router.push("/profile")} style={({ pressed }) => [styles.avatar, pressed && styles.quickActionPressed]}>
                <Text style={styles.avatarText}>r</Text>
              </Pressable>
            </View>
            <View style={styles.intro}>
              <Text style={styles.question}>How are you feeling today?</Text>
              <Text style={styles.subcopy}>There is no right answer. Just your answer.</Text>
              {unavailableActivityKeys.length > 0 ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.subcopy}>Some local activity is temporarily unavailable. Pull down to try again.</Text> : null}{usingLocalStarter ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.subcopy}>LOCAL STARTER PREVIEW · recommendations use only saved preferences and curated content until local activity is available again.</Text> : null}
            </View>
            <FlatList
              data={orderedMoods}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.moodList}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedMood;
                return (
                  <Pressable
                    onPress={() => chooseMood(item.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${item.label} mood${isSelected ? ", selected" : ""}`}
                    accessibilityState={{ selected: isSelected }}
                    style={({ pressed }) => [
                      styles.moodChip,
                      { backgroundColor: isSelected ? "#2B1D2F" : item.tint },
                      isSelected && !reduceMotion && styles.selectedMood,
                      pressed && styles.quickActionPressed,
                    ]}
                  >
                    <Text style={styles.moodEmoji}>{item.emoji}</Text>
                    <Text style={[styles.moodLabel, isSelected && styles.selectedMoodLabel]}>{item.label}</Text>
                  </Pressable>
                );
              }}
            />
            {moodIsExploring ? <Text style={styles.explorationBadge}>Exploring new options for you</Text> : null}
            <View style={styles.quickActionsSection}>
              <Text style={styles.quickActionsTitle}>Need a softer next step?</Text>
              {showUpgradeCard ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Unlock Rarely Plus membership plans"
                  onPress={() => router.push({ pathname: "/membership", params: { source: "home_usage" } } as never)}
                  style={({ pressed }) => [styles.upgradeCard, pressed && styles.quickActionPressed]}
                >
                  <Text style={styles.upgradeKicker}>RARELY PLUS</Text>
                  <Text style={styles.upgradeTitle}>You are building momentum.</Text>
                  <Text style={styles.upgradeBody}>Start your free trial for premium rituals, deeper journaling insights, and early feature access.</Text>
                  <Text style={styles.upgradeAction}>View plans →</Text>
                </Pressable>
              ) : null}
              <View style={styles.quickActionsRow}>
                {quickActions.map((action) => (
                  <Pressable
                    key={action.id}
                    accessibilityRole="button"
                    accessibilityLabel={action.label}
                    onPress={() => openQuickAction(action.route)}
                    style={({ pressed }) => [styles.quickAction, pressed && styles.quickActionPressed]}
                  >
                    <Text style={styles.quickActionEmoji}>{action.emoji}</Text>
                    <Text style={styles.quickActionLabel}>{action.label}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </FadeInView>
        }
        renderItem={() => (
          <FadeInView delay={90} duration={360}>

            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>{profile.recentActivity ? "A moment for your rhythm" : "Your Rare Moment"}</Text>
              <Text style={styles.duration}>10 MIN</Text>
            </View>
            <Animated.View style={[styles.momentCard, { backgroundColor: moment.color, opacity: moodTransition, transform: [{ scale: moodTransition }] }]}>
              <Image source={{ uri: moodVisuals[selectedMood] }} resizeMode="cover" accessibilityLabel={`${selectedMood} mood visual`} style={styles.momentVisual} />
              <View style={styles.momentTop}>
                <View style={styles.momentIcon}><Text style={styles.momentIconText}>✦</Text></View>
                <Text style={styles.momentKicker}>MADE FOR THIS FEELING</Text>
              </View>
              <Text style={styles.momentTitle}>{moment.title}</Text>
              <Text style={styles.momentBody}>{moment.body}</Text>
              <View accessible accessibilityLiveRegion="polite" accessibilityLabel={`Why this was suggested: ${rationale}`} style={styles.rationale}><Text style={styles.rationaleLabel}>WHY THIS WAS SUGGESTED</Text><Text style={styles.rationaleText}>{rationale}{moodIsExploring ? " We are still learning what fits best for this mood." : ""}</Text><FadeInView key={recommendationFeedback ?? "none"} duration={180} distance={3}><View style={styles.feedbackRow}><Pressable accessibilityRole="button" accessibilityLabel="This recommendation fits me" onPress={() => respondToRecommendation("fits")} style={[styles.feedbackButton, recommendationFeedback === "fits" && styles.feedbackSelected]}><Text style={styles.feedbackText}>{recommendationFeedback === "fits" ? (moodSummary.confidence === "high" ? "Strong fit ✓" : "Fits ✓") : "This fits"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="This recommendation is not for me" onPress={() => respondToRecommendation("dismissed")} style={[styles.feedbackButton, recommendationFeedback === "dismissed" && styles.feedbackSelected]}><Text style={styles.feedbackText}>{recommendationFeedback === "dismissed" ? "Noted ✓" : "Not for me"}</Text></Pressable></View></FadeInView>{profile.totalMemories > 0 ? <Text style={styles.memorySignal}>{profile.totalMemories} private {profile.totalMemories === 1 ? "memory" : "memories"} shaping your space</Text> : null}</View>
              <View style={styles.steps}>
                {moment.steps.map((step, index) => (
                  <View key={step} style={styles.stepRow}>
                    <View style={styles.stepNumber}><Text style={styles.stepNumberText}>{index + 1}</Text></View>
                    <Text style={styles.stepText}>{step}</Text>
                  </View>
                ))}
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel={`Start a ${selectedMood} rare moment`} onPress={() => { void startMoment(); }} style={({ pressed }) => [styles.startButton, pressed && styles.pressed]}>
                <View>
                  <Text style={styles.startButtonText}>Start moment</Text>
                  <Text style={styles.startButtonSubtext}>10 minutes, no pressure</Text>
                </View>
                <Text style={styles.arrow}>→</Text>
              </Pressable>
            </Animated.View>
            <View style={styles.footerPrompt}>
              <Text style={styles.footerTitle}>Less comparison. More you.</Text>
              <Text style={styles.footerBody}>Your space for small rituals, creative sparks, and being exactly where you are.</Text><Text style={styles.personalizedHint}>A little nudge for {interestHint}.</Text>{showMore && <FadeInView duration={180} distance={4}><View style={styles.moreCard}><Text style={styles.moreTitle}>Keep exploring</Text><Text style={styles.moreBody}>Try Create for a fresh prompt, or open Profile to change your path.</Text></View></FadeInView>}<Pressable onPress={() => setShowMore((current) => !current)} style={({ pressed }) => [styles.moreButton, pressed && styles.quickActionPressed]}><Text style={styles.moreButtonText}>{showMore ? "Show less" : "More for you"}</Text><Text style={styles.moreArrow}>{showMore ? "↑" : "↓"}</Text></Pressable>
            </View>
          </FadeInView>
        )}
      />
      <Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 32 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  eyebrow: { color: "#E96F61", fontSize: 12, fontWeight: "800", letterSpacing: 3 },
  greeting: { color: "#2B1D2F", fontSize: 24, fontWeight: "700", marginTop: 7 },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#D9CDE7", alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#2B1D2F", fontSize: 22, fontWeight: "700", fontStyle: "italic" },
  intro: { marginTop: 34 },
  question: { color: "#2B1D2F", fontSize: 32, lineHeight: 37, fontWeight: "700", maxWidth: 310 },
  subcopy: { color: "#7E6F7D", fontSize: 15, marginTop: 10 },
  moodList: { gap: 9, paddingVertical: 24 },
  moodChip: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 24, paddingHorizontal: 14, paddingVertical: 11 },
  quickActionsSection: { marginTop: 2, marginBottom: 14 },
  quickActionsTitle: { color: "#7E6F7D", fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  upgradeCard: { backgroundColor: "#2B1D2F", borderRadius: 18, padding: 14, marginTop: 10, marginBottom: 8 },
  upgradeKicker: { color: "#F28A7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  upgradeTitle: { color: "#FFF7F2", fontSize: 16, fontWeight: "700", marginTop: 6 },
  upgradeBody: { color: "#D6C8D3", fontSize: 12, lineHeight: 17, marginTop: 4 },
  upgradeAction: { color: "#FFF7F2", fontSize: 12, fontWeight: "700", marginTop: 9 },
  quickActionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  quickAction: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EDE4E0",
    borderWidth: 1,
    borderRadius: 16,
    minHeight: 46,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    flexGrow: 1,
    flexBasis: 100,
  },
  quickActionPressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  quickActionEmoji: { color: "#2B1D2F", fontSize: 12 },
  quickActionLabel: { color: "#2B1D2F", fontSize: 12, fontWeight: "700" },
  selectedMood: { elevation: 3 },
  moodEmoji: { fontSize: 15 },
  moodLabel: { color: "#2B1D2F", fontSize: 13, fontWeight: "600" },
  selectedMoodLabel: { color: "#FFF7F2" },
  explorationBadge: { color: "#5F4A5E", fontSize: 11, fontWeight: "700", marginTop: -12, marginBottom: 8 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  sectionTitle: { color: "#2B1D2F", fontSize: 18, fontWeight: "700" },
  duration: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 1.4 },
  momentCard: { borderRadius: 28, padding: 22, overflow: "hidden", borderWidth: 1, borderColor: "rgba(43,29,47,0.08)", boxShadow: "0px 6px 14px rgba(43,29,47,0.08)" },
  momentVisual: { width: "100%", height: 118, borderRadius: 20, marginBottom: 4 },
  momentTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  momentIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.72)", alignItems: "center", justifyContent: "center" },
  momentIconText: { color: "#2B1D2F", fontSize: 16 },
  momentKicker: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  momentTitle: { color: "#2B1D2F", fontSize: 25, lineHeight: 30, fontWeight: "700", marginTop: 20 },
  momentBody: { color: "#5F4A5E", fontSize: 14, lineHeight: 20, marginTop: 6 },
  rationale: { backgroundColor: "rgba(255,255,255,0.5)", borderRadius: 14, padding: 12, marginTop: 14 },
  rationaleLabel: { color: "#7E6F7D", fontSize: 9, fontWeight: "800", letterSpacing: 1.2 },
  rationaleText: { color: "#5F4A5E", fontSize: 12, lineHeight: 17, marginTop: 4, maxWidth: 290 },
  feedbackRow: { flexDirection: "row", gap: 8, marginTop: 10 }, feedbackButton: { borderColor: "rgba(43,29,47,0.18)", borderWidth: 1, borderRadius: 12, minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, justifyContent: "center" }, feedbackSelected: { backgroundColor: "rgba(255,255,255,0.75)" }, feedbackText: { color: "#5F4A5E", fontSize: 11, fontWeight: "700" }, memorySignal: { color: "#7E6F7D", fontSize: 11, lineHeight: 16, marginTop: 8, fontWeight: "700" },
  steps: { gap: 11, marginTop: 20 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 11 },
  stepNumber: { width: 23, height: 23, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center" },
  stepNumberText: { color: "#2B1D2F", fontSize: 11, fontWeight: "700" },
  stepText: { color: "#2B1D2F", fontSize: 14, flex: 1 },
  startButton: { marginTop: 24, backgroundColor: "#2B1D2F", borderRadius: 18, paddingVertical: 15, paddingHorizontal: 17, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pressed: { opacity: 0.86, transform: [{ scale: 0.98 }] },
  startButtonText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" },
  startButtonSubtext: { color: "#C6B9C4", fontSize: 11, marginTop: 2, fontWeight: "600" },
  arrow: { color: "#FFF7F2", fontSize: 20 },
  footerPrompt: { paddingVertical: 28, paddingHorizontal: 6 },
  footerTitle: { color: "#2B1D2F", fontSize: 17, fontWeight: "700" },
  footerBody: { color: "#7E6F7D", fontSize: 14, lineHeight: 21, marginTop: 6 },
  personalizedHint: { color: "#E96F61", fontSize: 12, fontWeight: "700", marginTop: 13 },
  moreCard: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 13 },
  moreTitle: { color: "#2B1D2F", fontSize: 14, fontWeight: "700" },
  moreBody: { color: "#7E6F7D", fontSize: 13, lineHeight: 18, marginTop: 4 },
  moreButton: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 14 },
  moreButtonText: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" },
  moreArrow: { color: "#E96F61", fontSize: 16 },
});
