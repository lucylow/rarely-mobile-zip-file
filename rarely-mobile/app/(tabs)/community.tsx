import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { useCallback, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { scorePreferences } from "@/lib/ux/onboardingPersonalization";
import {
  applyRecommendationFeedback,
  buildPersonalizationProfile,
  isRecommendationExploring,
  rankCommunityCircles,
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
import { Snackbar } from "@/components/ui/snackbar";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { reportNonFatalError } from "@/lib/non-fatal-error";
import { safeJsonParse } from "@/lib/utils";
import { triggerLightImpact } from "@/lib/ux/haptics";
import { loadLocalActivitySnapshot } from "@/lib/ux/localActivity";

const circles = [
  {
    id: "creative",
    title: "Make Room for Ideas",
    members: "Creative circle",
    color: "#D9CDE7",
    prompt: "What are you curious about this week?",
  },
  {
    id: "confidence",
    title: "Soft Confidence",
    members: "Confidence circle",
    color: "#F5D7CF",
    prompt: "Name a quality you bring into every room.",
  },
  {
    id: "music",
    title: "The Listening Room",
    members: "Music circle",
    color: "#D8E1D5",
    prompt: "What song feels like a deep breath today?",
  },
];

const FEATURED_CIRCLE_ID = "creative";

export default function CommunityScreen() {
  const [profile, setProfile] = useState<PersonalizationProfile>(() =>
    buildPersonalizationProfile(scorePreferences({}), {
      journalCount: 0,
      momentCount: 0,
      circleCount: 0,
      routineCount: 0,
    }),
  );
  const [orderedCircles, setOrderedCircles] = useState(circles);
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
      setIsUsingFallback(activity.unavailableKeys.length > 0);

      const preferences = scorePreferences(safeJsonParse(preferencesValue, {}));
      const joinedCount = activity.circles.length;
      const nextProfile = buildPersonalizationProfile(preferences, {
        journalCount: 0,
        momentCount: 0,
        circleCount: joinedCount,
        routineCount: 0,
      });
      const nextFeedback = feedbackValue;
      setProfile(nextProfile);
      setFeedback(nextFeedback);
      setOrderedCircles(rankCommunityCircles(circles, nextProfile, nextFeedback));
      const premium = isPremiumActive(monetizationState);
      setPremiumActive(premium);
      setLockedPromptAvailable(!premium && canShowUpgradePrompt(promptState));
    } catch (error) {
      reportNonFatalError("community:load-data", error);
      if (!isActive()) return;
      setOrderedCircles(circles);
      setProfile(buildPersonalizationProfile(scorePreferences({}), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 }));
      setFeedback({});
      setPremiumActive(false);
      setLockedPromptAvailable(false);
      setIsUsingFallback(true);
      setSnackbar("Community is using offline suggestions. Reopen to retry.");
    }
  }, [retryToken]);

  const respond = async (id: string, kind: "fits" | "dismissed") => {
    const key = recommendationKey("circle", id);
    const timestamp = new Date().toISOString();
    const previous = feedback;
    const next = applyRecommendationFeedback(feedback, key, kind, timestamp);
    setFeedback(next);
    setOrderedCircles(rankCommunityCircles(circles, profile, next));
    try {
      await saveRecommendationFeedback(next);
      await appendPersonalizationHistory({
        kind: "recommendation",
        value: `${kind}:circle:${id}`,
        at: timestamp,
      });
    } catch (error) {
      reportNonFatalError("community:save-recommendation-feedback", error, { circleId: id, kind });
      setFeedback(previous);
      setOrderedCircles(rankCommunityCircles(circles, profile, previous));
      setSnackbar("Could not save recommendation feedback");
    }
  };

  const openCircle = useCallback(
    async (id: string, title: string, prompt: string, isLocked: boolean) => {
      try {
        await triggerLightImpact();
        if (isLocked && !premiumActive) {
          if (lockedPromptAvailable) {
            try {
              await recordUpgradePromptShown(AsyncStorage, `community_circle_${id}`);
            } catch (error) {
              reportNonFatalError("community:record-upgrade-prompt", error, { circleId: id });
            }
            setLockedPromptAvailable(false);
          }
          setSnackbar("Featured circles are unlocked with Rarely Plus.");
          router.push({ pathname: "/membership", params: { source: `community_circle_${id}` } } as never);
          return;
        }
        router.push({ pathname: "/circle", params: { id, title, prompt } });
      } catch (error) {
        reportNonFatalError("community:open-circle", error, { circleId: id });
        setSnackbar("Could not open this circle right now");
      }
    },
    [lockedPromptAvailable, premiumActive],
  );

  return (
    <ScreenContainer className="px-5 pt-5">
      <FlatList
        data={orderedCircles}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>FIND YOUR PEOPLE</Text>
            <Text style={styles.title}>A little more together.</Text>
            <Text style={styles.subtitle}>Thoughtful circles for sharing ideas, not measuring yourself.</Text>
            {isUsingFallback ? <View style={styles.recovery}><Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.subtitle}>OFFLINE STARTER PREVIEW · curated community suggestions are shown for now. Your private activity was not used.</Text><Pressable accessibilityRole="button" accessibilityLabel="Retry loading Community recommendations" onPress={() => setRetryToken((value) => value + 1)} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}><Text style={styles.retryText}>Retry</Text></Pressable></View> : null}
            {unavailableActivityKeys.length > 0 ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.subtitle}>Some local activity signals are temporarily unavailable. Reopen this screen to try again.</Text> : null}
            <View accessibilityLiveRegion="polite" style={styles.personalized}>
              <Text style={styles.personalizedLabel}>
                FOR THIS {timeAwarePrompt(profile).split(" for ")[0].toUpperCase()}
              </Text>
              <Text style={styles.personalizedText}>{timeAwarePrompt(profile)}</Text>
            </View>
            <View style={styles.note}>
              <Text style={styles.noteIcon}>♡</Text>
              <Text style={styles.noteText}>Community spaces are designed to stay kind, curious, and moderated.</Text>
            </View>
            {!premiumActive ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Unlock Rarely Plus community circles"
                onPress={() => router.push({ pathname: "/membership", params: { source: "community_header" } } as never)}
                style={({ pressed }) => [styles.plusCard, pressed && styles.pressed]}
              >
                <Text style={styles.plusKicker}>RARELY PLUS</Text>
                <Text style={styles.plusTitle}>Unlock featured circles</Text>
                <Text style={styles.plusBody}>
                  Join member-only conversations curated around creativity and confidence.
                </Text>
                <Text style={styles.plusAction}>View plans →</Text>
              </Pressable>
            ) : null}
            <Text style={styles.section}>Explore circles</Text>
          </View>
        }
        renderItem={({ item }) => {
          const key = recommendationKey("circle", item.id);
          const summary = summarizeRecommendationFeedback(feedback, key);
          const exploring = isRecommendationExploring(feedback, key);
          const selectedFeedback = selectedFeedbackKind(feedback, key);
          const isLocked = item.id === FEATURED_CIRCLE_ID;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${item.title}. ${item.prompt}`}
              onPress={() => void openCircle(item.id, item.title, item.prompt, isLocked)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: item.color },
                isLocked && !premiumActive && styles.lockedCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.members}>{item.members}</Text>
                <View style={styles.badges}>
                  <Text style={styles.save}>♡</Text>
                  {isLocked ? <Text style={styles.lockBadge}>{premiumActive ? "PLUS" : "PLUS LOCKED"}</Text> : null}
                </View>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.prompt}>{item.prompt}</Text>
              <Text
                accessibilityLabel={`Why this circle is recommended: ${profile.topInterestKey === "community" && item.id === "creative" ? "it matches your interest in positive community" : item.id === "music" && profile.topInterestKey === "music" ? "it matches your interest in music discovery" : "it offers a gentle way to explore something new"}`}
                style={styles.why}
              >
                Why this fits:{" "}
                {profile.topInterestKey === "community" && item.id === "creative"
                  ? "your interest in positive community"
                  : item.id === "music" && profile.topInterestKey === "music"
                    ? "your interest in music discovery"
                    : "a gentle way to explore something new"}
                {exploring ? " · still learning your circle style" : ""}
              </Text>
              {exploring ? <Text style={styles.explorationChip}>Exploring new options for you</Text> : null}
              <View style={styles.feedbackRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`This circle fits: ${item.title}`}
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
                  accessibilityLabel={`This circle is not for me: ${item.title}`}
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
              <Text style={styles.join}>{isLocked && !premiumActive ? "Unlock with Rarely Plus  →" : "View circle  →"}</Text>
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
  note: {
    backgroundColor: "#FFFFFF",
    borderColor: "#EDE4E0",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  noteIcon: { color: "#E96F61", fontSize: 22 },
  noteText: { color: "#7E6F7D", fontSize: 13, lineHeight: 18, flex: 1 },
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
  section: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 26, marginBottom: 2 },
  card: { borderRadius: 24, padding: 18 },
  lockedCard: { borderWidth: 1, borderColor: "rgba(43,29,47,0.15)" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  members: { color: "#7E6F7D", fontSize: 11, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" },
  badges: { flexDirection: "row", alignItems: "center", gap: 8 },
  save: { color: "#2B1D2F", fontSize: 22 },
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
  cardTitle: { color: "#2B1D2F", fontSize: 21, fontWeight: "700", marginTop: 20 },
  prompt: { color: "#5F4A5E", fontSize: 14, lineHeight: 20, marginTop: 7 },
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
  join: { color: "#2B1D2F", fontSize: 13, fontWeight: "700", marginTop: 20 },
});
