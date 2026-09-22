import { useCallback, useState } from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { FadeInView } from "@/components/ui/fade-in-view";
import { scorePreferences } from "@/lib/ux/onboardingPersonalization";
import {
  applyRecommendationFeedback,
  buildPersonalizationProfile,
  isRecommendationExploring,
  aiCreativeModes, personalizedAiPrompt, personalizedCreatePrompt,
  rankCreateTools,
  recommendationKey,
  selectedFeedbackKind,
  summarizeRecommendationFeedback,
  type PersonalizationProfile,
  type RecommendationFeedback,
} from "@/lib/ux/personalization";
import { Snackbar } from "@/components/ui/snackbar";
import { isPremiumActive, loadMonetizationState } from "@/lib/ux/monetization";
import { appendPersonalizationHistory, loadAiMode, loadRecommendationFeedback, saveAiMode, saveRecommendationFeedback } from "@/lib/ux/localStorage";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { runGuarded } from "@/lib/ux/guards";
import { reportNonFatalError } from "@/lib/non-fatal-error";
import { safeJsonParse } from "@/lib/utils";
import { triggerLightImpact } from "@/lib/ux/haptics";
import { checkAiOutput, checkAiRequest } from "@/lib/ux/aiSafety";
import { getAiPromptPolicy } from "@/lib/ux/aiPrompts";

type DraftRecord = { text: string; updatedAt?: string; prompt?: string };

const toolVisuals: Record<string, string> = {
  photo: "/manus-storage/rarely-scrapbook-color_bbc09103.png",
  music: "/manus-storage/rarely-card-soundtrack_0c075ac6.png",
  collage: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png",
  ai: "/manus-storage/rarely-card-movement_ff8eddc9.png",
};

const tools = [
  { id: "journal", icon: "✍︎", title: "Journal", body: "A private place for the thought you want to keep.", color: "#F5D7CF" },
  { id: "photo", icon: "◌", title: "Photo prompt", body: "See something ordinary in a new way.", color: "#D9CDE7" },
  { id: "music", icon: "♫", title: "Music mood", body: "Build a soundtrack for exactly this moment.", color: "#D8E1D5" },
  { id: "collage", icon: "▦", title: "Collage", body: "Collect colors, textures, and little sparks.", color: "#F8E3A8" },
  { id: "ai", icon: "✦", title: "Rare AI", body: "Ask for a creative idea, not a perfect answer.", color: "#F6C7B7" },
  { id: "sponsor", icon: "◇", title: "Sponsor Studio", body: "Build a style direction with transparent demo providers.", color: "#E7D9C6" },
];

const createJourneys: Partial<Record<(typeof tools)[number]["id"], { prompt: string; starter: string }>> = {
  photo: {
    prompt: "Capture one ordinary detail and describe why it feels like this moment.",
    starter: "Photo note:\n- What I noticed:\n- Why this detail stood out:\n- One feeling this image carries:",
  },
  music: {
    prompt: "Build a 3-song mood set and describe what each song unlocks in you.",
    starter: "Music mood set:\n1) \n2) \n3) \n\nHow this soundtrack feels in my body:",
  },
  collage: {
    prompt: "Collect three textures, colors, or words that match your current energy.",
    starter: "Collage fragments:\n- Texture:\n- Color:\n- Word:\n\nWhat these fragments say about today:",
  },
  ai: {
    prompt: "Ask yourself one wild creative question and answer it without editing.",
    starter: "Creative question:\n\nMy first answer (no overthinking):",
  },
};

export default function CreateScreen() {
  const [journalCount, setJournalCount] = useState(0);
  const [focusLabel, setFocusLabel] = useState("your curiosity");
  const [profile, setProfile] = useState<PersonalizationProfile>(() => buildPersonalizationProfile(scorePreferences({}), { journalCount: 0, momentCount: 0, circleCount: 0, routineCount: 0 }));
  const [orderedTools, setOrderedTools] = useState(tools);
  const [feedback, setFeedback] = useState<RecommendationFeedback>({});
  const [draft, setDraft] = useState<DraftRecord | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [discardedDraft, setDiscardedDraft] = useState<DraftRecord | null>(null);
  const [premiumActive, setPremiumActive] = useState(false);
  const [aiMode, setAiMode] = useState<(typeof aiCreativeModes)[number]["id"]>("spark");
  useAsyncFocusEffect(async (isActive) => {
    const loaded = await runGuarded(async () => Promise.all([
      AsyncStorage.getItem("rarely.journalEntries"),
      AsyncStorage.getItem("rarely.preferences"),
      AsyncStorage.getItem("rarely.journalDraft"),
      AsyncStorage.getItem("rarely.completedMoments"),
      AsyncStorage.getItem("rarely.joinedCircles"),
      AsyncStorage.getItem("rarely.completedRoutines"),
      loadRecommendationFeedback(),
      loadMonetizationState(AsyncStorage),
    ]), (error) => {
      reportNonFatalError("create:load-data", error);
      if (isActive()) setSnackbar("Unable to refresh Create right now");
    });
    if (!loaded || !isActive()) return;
    const savedAiMode = await loadAiMode();
    const [
        entriesValue,
        preferencesValue,
        draftValue,
        momentsValue,
        circlesValue,
        routinesValue,
        feedbackValue,
        monetizationState,
      ] = loaded;

    const parsedDraft = safeJsonParse<DraftRecord>(draftValue, { text: draftValue ?? "" });
    setDraft(draftValue?.trim() ? (parsedDraft.text ? parsedDraft : { text: draftValue }) : null);

    const journalEntries = safeJsonParse<{ date?: string }[]>(entriesValue, []);
    const momentsSaved = safeJsonParse<unknown[]>(momentsValue, []);
    const circlesJoined = safeJsonParse<unknown[]>(circlesValue, []);
    const routinesCompleted = safeJsonParse<unknown[]>(routinesValue, []);
    const personalizationFeedback = feedbackValue;
    const preferences = scorePreferences(safeJsonParse(preferencesValue, {}));
    const nextProfile = buildPersonalizationProfile(preferences, {
      journalCount: journalEntries.length,
      momentCount: momentsSaved.length,
      circleCount: circlesJoined.length,
      routineCount: routinesCompleted.length,
    });
    if (!isActive()) return;
    setJournalCount(journalEntries.length);
    setProfile(nextProfile);
    setFocusLabel(nextProfile.topInterestLabel);
    setFeedback(personalizationFeedback);
    setOrderedTools(rankCreateTools(tools, nextProfile, personalizationFeedback));
    setPremiumActive(isPremiumActive(monetizationState));
    if (savedAiMode) setAiMode(savedAiMode);
  }, []);

  const respond = useCallback(async (id: string, kind: "fits" | "dismissed") => {
    const previousFeedback = feedback;
    const key = recommendationKey("create", id);
    const timestamp = new Date().toISOString();
    const next = applyRecommendationFeedback(feedback, key, kind, timestamp);
    setFeedback(next);
    setOrderedTools(rankCreateTools(tools, profile, next));
    const persisted = await runGuarded(async () => {
      await saveRecommendationFeedback(next);
      await appendPersonalizationHistory({ kind: "recommendation", value: `${kind}:create:${id}`, at: timestamp });
    }, (error) => {
      reportNonFatalError("create:save-recommendation-feedback", error, { toolId: id, kind });
      setFeedback(previousFeedback);
      setOrderedTools(rankCreateTools(tools, profile, previousFeedback));
      setSnackbar("Could not save Create feedback");
    });
    if (persisted !== undefined) {
      setSnackbar(kind === "fits" ? "Saved: this Create suggestion fits" : "Saved: we will show less of this");
    }
  }, [feedback, profile]);

  const discardDraft = useCallback(async () => {
    if (!draft) return;
    setDiscardedDraft(draft);
    const discarded = await runGuarded(async () => {
      await AsyncStorage.removeItem("rarely.journalDraft");
      setDraft(null);
      setSnackbar("Private draft discarded");
    }, (error) => {
      reportNonFatalError("create:discard-draft", error);
      setSnackbar("Could not discard draft");
    });
    if (discarded === undefined) {
      setDiscardedDraft(null);
    }
  }, [draft]);

  const undoDiscard = useCallback(async () => {
    if (!discardedDraft) return;
    const restored = await runGuarded(async () => {
      await AsyncStorage.setItem("rarely.journalDraft", JSON.stringify(discardedDraft));
      setDraft(discardedDraft);
      setDiscardedDraft(null);
      setSnackbar("Draft restored");
    }, (error) => {
      reportNonFatalError("create:restore-draft", error);
      setSnackbar("Could not restore draft");
    });
    if (restored === undefined) {
      return;
    }
  }, [discardedDraft]);

  const handleToolPress = useCallback(
    async (id: (typeof tools)[number]["id"], title: string) => {
      try {
        await triggerLightImpact();
        if (id === "journal") {
          router.push("/journal");
          return;
        }
        if (id === "sponsor") {
          router.push("/sponsor-studio" as never);
          return;
        }
        if (!premiumActive) {
          router.push({ pathname: "/membership", params: { source: `create_tool_${id}` } } as never);
          return;
        }
        const journey = createJourneys[id];
        if (id === "ai") {
          router.push("/creative-lab" as never);
          return;
        }
        if (journey) {
          let promptOverride = journey.prompt;
          let promptSource: "governed" | "private-fallback" | undefined;
          if (id === "ai") {
            const policy = getAiPromptPolicy(aiMode);
            const requestSafe = checkAiRequest({
              task: "creative",
              requestId: `create-${Date.now()}`,
              context: { interest: profile.topInterestKey, mode: aiMode },
              userConsented: true,
            });
            const generatedPrompt = personalizedAiPrompt(profile, aiMode);
            const governed = policy.enabled && requestSafe.allowed && checkAiOutput(generatedPrompt).allowed;
            promptOverride = governed ? generatedPrompt : policy.fallback;
            promptSource = governed ? "governed" : "private-fallback";
          }
          router.push({
            pathname: "/journal",
            params: {
              initial: journey.starter,
              promptOverride,
              ...(promptSource ? { promptSource } : {}),
            },
          });
          return;
        }
        setSnackbar("Tool opened");
      } catch (error) {
        reportNonFatalError("create:open-tool", error, { toolId: id });
        setSnackbar(`Could not open ${title} right now`);
      }
    },
    [aiMode, premiumActive, profile],
  );

  return (
    <ScreenContainer className="px-5 pt-5">
      <FlatList
        data={orderedTools}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={<FadeInView duration={320}><View><Text style={styles.eyebrow}>MAKE SOMETHING</Text><Text style={styles.title}>Create from where you are.</Text><Text style={styles.subtitle}>{personalizedCreatePrompt(profile)} {focusLabel === "your curiosity" ? "" : "A little space is enough."}</Text>{!premiumActive ? <Pressable accessibilityRole="button" accessibilityLabel="Unlock Rarely Plus to access premium Create tools" onPress={() => router.push({ pathname: "/membership", params: { source: "create_header" } } as never)} style={({ pressed }) => [styles.plusCard, pressed && styles.pressed]}><Text style={styles.plusKicker}>RARELY PLUS</Text><Text style={styles.plusTitle}>Unlock premium Create tools</Text><Text style={styles.plusBody}>Start a free trial to get early access to AI prompts, collage features, and new creative packs.</Text><Text style={styles.plusAction}>View plans →</Text></Pressable> : null}<Pressable accessibilityRole="button" accessibilityLabel={`Saved journal${journalCount ? `, ${journalCount} entries` : ""}`} onPress={() => router.push("/journal-library")} style={styles.savedLink}><Text style={styles.savedLinkText}>Saved journal {journalCount > 0 ? `(${journalCount})` : ""}</Text><Text style={styles.savedLinkArrow}>→</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="View favorite Rare AI prompts" onPress={() => router.push("/ai-history?filter=favorites" as never)} style={styles.savedLink}><Text style={styles.savedLinkText}>Favorite AI prompts</Text><Text style={styles.savedLinkArrow}>→</Text></Pressable>{draft ? <View style={styles.draftCard}><Text style={styles.draftKicker}>PRIVATE DRAFT</Text><Text numberOfLines={2} style={styles.draftText}>{draft.text}</Text>{draft.prompt ? <Text numberOfLines={1} style={styles.draftPrompt}>Prompt: {draft.prompt}</Text> : null}{draft.updatedAt ? <Text style={styles.draftDate}>Saved {new Date(draft.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Text> : null}<View style={styles.draftActions}><Pressable accessibilityRole="button" accessibilityLabel="Resume saved journal draft" onPress={() => router.push({ pathname: "/journal", params: { initial: draft.text, recoveredPrompt: draft.prompt, recoveredUpdatedAt: draft.updatedAt } })} style={styles.resume}><Text style={styles.resumeText}>Resume draft</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Discard saved journal draft" onPress={discardDraft} style={styles.discard}><Text style={styles.discardText}>Discard</Text></Pressable></View></View> : null}</View></FadeInView>}
        renderItem={({ item, index }) => {
          const key = recommendationKey("create", item.id);
          const summary = summarizeRecommendationFeedback(feedback, key);
          const exploring = isRecommendationExploring(feedback, key);
          const selectedFeedback = selectedFeedbackKind(feedback, key);
          return <FadeInView delay={Math.min(index * 45, 180)} duration={300}><Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. ${item.body}`} onPress={() => { void handleToolPress(item.id, item.title); }} style={({ pressed }) => [styles.card, { backgroundColor: item.color }, pressed && styles.pressed]}>
            {toolVisuals[item.id] ? <Image source={{ uri: toolVisuals[item.id] }} resizeMode="cover" accessibilityLabel={`${item.title} visual`} style={styles.toolVisual} /> : <View style={styles.icon}><Text style={styles.iconText}>{item.icon}</Text></View>}
            <View style={styles.copy}><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardBody}>{item.id === "journal" && journalCount > 0 ? `${journalCount} saved ${journalCount === 1 ? "entry" : "entries"} · ` : ""}{item.body}</Text>{item.id === "sponsor" ? <Text style={styles.aiPrivacy}>MOCK-FIRST DEMO · no sponsor API keys required; provider activity is simulated and clearly disclosed.</Text> : null}{item.id === "ai" ? <><Text style={styles.aiPrivacy}>Uses only your selected preferences and current creative direction — never journal text or private images.</Text><View accessibilityRole="radiogroup" accessibilityLabel="Rare AI creative mode" style={styles.aiModes}>{aiCreativeModes.map((mode) => <Pressable key={mode.id} accessibilityRole="radio" accessibilityState={{ selected: aiMode === mode.id }} accessibilityLabel={`${mode.label}: ${mode.description}`} onPress={(event) => { event.stopPropagation(); setAiMode(mode.id); void saveAiMode(mode.id).catch(() => setSnackbar("Could not save AI mode")); }} style={[styles.aiMode, aiMode === mode.id && styles.aiModeSelected]}><Text style={[styles.aiModeText, aiMode === mode.id && styles.aiModeTextSelected]}>{mode.label}</Text></Pressable>)}</View><Text style={styles.aiModeHint}>{aiCreativeModes.find((mode) => mode.id === aiMode)?.description}</Text></> : null}<Text style={styles.why}>Why this fits: {item.id === orderedTools[0]?.id ? `it aligns with ${focusLabel}` : "it can add variety to your flow"}{exploring ? " · still learning your Create rhythm" : ""}</Text>{exploring ? <Text style={styles.explorationChip}>Exploring new options for you</Text> : null}<FadeInView key={`${item.id}-${selectedFeedback ?? "none"}`} duration={180} distance={3}><View style={styles.feedbackRow}><Pressable accessibilityRole="button" accessibilityLabel={`This Create suggestion fits: ${item.title}`} onPress={(event) => { event.stopPropagation(); if (selectedFeedback !== "fits") void respond(item.id, "fits"); }} style={[styles.feedbackButton, selectedFeedback === "fits" && styles.feedbackSelected]}><Text style={styles.feedbackText}>{selectedFeedback === "fits" ? (summary.confidence === "high" ? "Strong fit ✓" : "Fits ✓") : "This fits"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`This Create suggestion is not for me: ${item.title}`} onPress={(event) => { event.stopPropagation(); if (selectedFeedback !== "dismissed") void respond(item.id, "dismissed"); }} style={[styles.feedbackButton, selectedFeedback === "dismissed" && styles.feedbackSelected]}><Text style={styles.feedbackText}>{selectedFeedback === "dismissed" ? "Noted ✓" : "Not for me"}</Text></Pressable></View></FadeInView></View>
            <Text style={styles.arrow}>↗</Text>
          </Pressable></FadeInView>;
        }}
      />
      <Snackbar message={snackbar} actionLabel={discardedDraft ? "Undo" : undefined} onAction={discardedDraft ? undoDiscard : undefined} onDismiss={() => setSnackbar(null)} bottomOffset={72} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 30, gap: 12 },
  eyebrow: { color: "#E96F61", fontSize: 12, fontWeight: "800", letterSpacing: 2.4 },
  title: { color: "#2B1D2F", fontSize: 32, lineHeight: 37, fontWeight: "700", marginTop: 10, maxWidth: 320 },
  subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 21, marginTop: 10, marginBottom: 18 },
  plusCard: { backgroundColor: "#2B1D2F", borderRadius: 20, padding: 15, marginBottom: 12 },
  plusKicker: { color: "#F28A7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  plusTitle: { color: "#FFF7F2", fontSize: 18, fontWeight: "700", marginTop: 7 },
  plusBody: { color: "#D6C8D3", fontSize: 12, lineHeight: 17, marginTop: 5 },
  plusAction: { color: "#FFF7F2", fontSize: 12, fontWeight: "700", marginTop: 10 },
  savedLink: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  savedLinkText: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" },
  savedLinkArrow: { color: "#E96F61", fontSize: 18 },
  draftCard: { backgroundColor: "#FFF4E8", borderColor: "#F1D5C3", borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 6 },
  draftKicker: { color: "#E96F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  draftText: { color: "#5F4A5E", fontSize: 13, lineHeight: 18, marginTop: 7 },
  draftPrompt: { color: "#9C8D99", fontSize: 11, lineHeight: 16, marginTop: 7 },
  draftDate: { color: "#9C8D99", fontSize: 11, fontWeight: "700", marginTop: 5 },
  draftActions: { flexDirection: "row", gap: 18, marginTop: 12 },
  resume: { backgroundColor: "#2B1D2F", borderRadius: 13, paddingHorizontal: 13, paddingVertical: 9 },
  resumeText: { color: "#FFF7F2", fontSize: 12, fontWeight: "700" },
  discard: { paddingHorizontal: 8, paddingVertical: 9 },
  discardText: { color: "#B96861", fontSize: 12, fontWeight: "700" },
  card: { borderRadius: 23, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 13 },
  pressed: { opacity: 0.82, transform: [{ scale: 0.985 }] },
  toolVisual: { width: 58, height: 58, borderRadius: 17 },
  icon: { width: 45, height: 45, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.6)", alignItems: "center", justifyContent: "center" },
  iconText: { fontSize: 24, color: "#2B1D2F" },
  copy: { flex: 1 },
  cardTitle: { color: "#2B1D2F", fontSize: 17, fontWeight: "700" },
  aiModes: { flexDirection: "row", gap: 6, marginTop: 10 },
  aiMode: { borderColor: "#D9CBD5", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  aiModeSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" },
  aiModeText: { color: "#5F5262", fontSize: 11, fontWeight: "700" },
  aiModeTextSelected: { color: "#FFF7F2" },
  aiModeHint: { color: "#7E6F7D", fontSize: 11, lineHeight: 15, marginTop: 5 },
  aiPrivacy: { color: "#5F4A5E", fontSize: 11, lineHeight: 16, marginTop: 6 },
  cardBody: { color: "#5F4A5E", fontSize: 13, lineHeight: 18, marginTop: 3 },
  why: { color: "#7E6F7D", fontSize: 10, lineHeight: 14, fontWeight: "700", marginTop: 7 },
  explorationChip: { color: "#5F4A5E", fontSize: 10, fontWeight: "700", marginTop: 5 },
  feedbackRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 7 },
  feedbackButton: { borderColor: "rgba(43,29,47,0.18)", borderWidth: 1, borderRadius: 10, minHeight: 44, minWidth: 98, paddingHorizontal: 10, paddingVertical: 10, justifyContent: "center", alignItems: "center" },
  feedbackSelected: { backgroundColor: "rgba(255,255,255,0.7)" },
  feedbackText: { color: "#5F4A5E", fontSize: 10, fontWeight: "700" },
  arrow: { color: "#2B1D2F", fontSize: 22, marginTop: 4 },
});
