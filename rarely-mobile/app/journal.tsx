import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, BackHandler, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system/legacy";
import { ScreenContainer } from "@/components/screen-container";
import { Snackbar } from "@/components/ui/snackbar";
import { FadeInView } from "@/components/ui/fade-in-view";
import { safeJsonParse } from "@/lib/utils";
import { triggerSuccessNotification } from "@/lib/ux/haptics";
import { fallbackAiPrompt, refineAiPrompt, type AiPromptRefinement } from "@/lib/ux/personalization";
import { getAiGovernanceDisclosure } from "@/lib/ux/aiPrompts";
import { appendAiPromptHistory } from "@/lib/ux/localStorage";
import { clearJournalDraftBestEffort, isPrivateImageUri, loadJournalDraftBestEffort, validatePrivateImageUri } from "@/lib/ux/journalPersistence";
import { reportNonFatalError } from "@/lib/non-fatal-error";

const prompts = [
  "What feels a little lighter than it did yesterday?",
  "Describe one small detail you want to remember from today.",
  "What are you making room for right now?",
  "Write a kind sentence you would want to hear today.",
];

export default function JournalScreen() {
  const { initial, editIndex, recoveredPrompt, recoveredUpdatedAt, imageUri: initialImageUri, promptOverride, promptSource } = useLocalSearchParams<{ initial?: string; editIndex?: string; recoveredPrompt?: string; recoveredUpdatedAt?: string; imageUri?: string; promptOverride?: string; promptSource?: "governed" | "private-fallback" }>();
  const prompt = useMemo(() => prompts[new Date().getDate() % prompts.length], []);
  const [entry, setEntry] = useState("");
  const [saved, setSaved] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState<string | null>(null);
  const [draftUpdatedAt, setDraftUpdatedAt] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(initialImageUri ?? null);
  const [promptRefinement, setPromptRefinement] = useState<AiPromptRefinement | null>(null);
  const [aiFeedback, setAiFeedback] = useState<"useful" | "tryAnother" | null>(null);
  const [draftLoadState, setDraftLoadState] = useState<"idle" | "loaded" | "empty" | "malformed" | "unavailable">("idle");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [attachmentSkipped, setAttachmentSkipped] = useState(false);
  const [aiHistoryUnavailable, setAiHistoryUnavailable] = useState(false);
  const [draftPersistUnavailable, setDraftPersistUnavailable] = useState(false);
  const characterCount = entry.trim().length;
  const basePrompt = draftPrompt ?? promptOverride ?? prompt;
  const activePrompt = promptRefinement ? refineAiPrompt(basePrompt, promptRefinement) : basePrompt;
  const isAiPrompt = Boolean(promptOverride || recoveredPrompt);

  useEffect(() => {
    if (initial) { setEntry(initial); setImageUri(isPrivateImageUri(initialImageUri) ? initialImageUri : null); setDraftPrompt(recoveredPrompt ?? promptOverride ?? null); setDraftUpdatedAt(recoveredUpdatedAt ?? null); setDraftDirty(false); setDraftSaved(Boolean(recoveredUpdatedAt)); setDraftLoadState("loaded"); return; }
    const loadDraft = async () => {
      setLoadingDraft(true);
      try {
        const result = await loadJournalDraftBestEffort(AsyncStorage);
        setDraftLoadState(result.status);
        if (result.status === "empty") return;
        if (result.status === "unavailable") {
          setSnackbar("Could not check for a saved draft right now");
          return;
        }
        if (result.status === "malformed") {
          setSnackbar("A saved draft could not be restored");
          return;
        }
        setEntry(result.draft.text);
        const imageStatus = await validatePrivateImageUri(result.draft.imageUri, FileSystem);
        setAttachmentSkipped(result.attachmentSkipped || (isPrivateImageUri(result.draft.imageUri) && imageStatus !== "valid"));
        setImageUri(imageStatus === "valid" && isPrivateImageUri(result.draft.imageUri) ? result.draft.imageUri : null);
        setDraftPrompt(result.draft.prompt ?? null);
        setDraftUpdatedAt(result.draft.updatedAt ?? null);
        setDraftDirty(true);
        setDraftSaved(true);
      } catch (error) {
        reportNonFatalError("journal:load-draft", error);
        setDraftLoadState("unavailable");
        setSnackbar("Could not restore your private draft right now");
      } finally {
        setLoadingDraft(false);
      }
    };
    void loadDraft();
  }, [initial, initialImageUri, recoveredPrompt, recoveredUpdatedAt, promptOverride]);

  const saveDraft = useCallback(async (): Promise<boolean> => {
    const trimmed = entry.trim();
    if (!trimmed) return false;
    const updatedAt = new Date().toISOString();
    try {
      await AsyncStorage.setItem("rarely.journalDraft", JSON.stringify({ text: trimmed, updatedAt, prompt: activePrompt, imageUri: imageUri ?? undefined }));
      setDraftUpdatedAt(updatedAt);
      setDraftPrompt(activePrompt);
      setDraftDirty(false);
      setDraftSaved(true);
      setDraftPersistUnavailable(false);
      setSnackbar("Draft saved privately on this device");
      return true;
    } catch (error) {
      reportNonFatalError("journal:save-draft", error);
      setDraftPersistUnavailable(true);
      setSnackbar("Could not save draft right now; your current words remain in this session");
      return false;
    }
  }, [activePrompt, entry, imageUri]);

  const leaveJournal = useCallback(() => {
    if (!draftDirty) { router.back(); return; }
    Alert.alert("Keep this draft?", "You have unsaved words in your journal.", [
      { text: "Keep writing", style: "cancel" },
      { text: "Save draft and leave", onPress: async () => { if (await saveDraft()) router.back(); } },
      { text: "Discard", style: "destructive", onPress: async () => {
        try {
          await AsyncStorage.removeItem("rarely.journalDraft");
          setDraftDirty(false);
          setDraftSaved(false);
          setDraftUpdatedAt(null);
          router.back();
        } catch (error) {
          reportNonFatalError("journal:discard-draft", error);
          setDraftPersistUnavailable(true);
          setSnackbar("Could not discard draft right now; nothing was removed");
        }
      } },
    ]);
  }, [draftDirty, saveDraft]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      leaveJournal();
      return true;
    });
    return () => subscription.remove();
  }, [leaveJournal]);

  const saveEntry = async () => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    try {
      const rawEntries = await AsyncStorage.getItem("rarely.journalEntries");
      const existing = safeJsonParse<{ text: string; date: string; imageUri?: string }[]>(rawEntries, []);
      const next = editIndex !== undefined && Number.isInteger(Number(editIndex))
        ? existing.map((saved, index) => index === Number(editIndex) ? { ...saved, text: trimmed, imageUri: imageUri ?? undefined } : saved)
        : [{ text: trimmed, date: new Date().toISOString(), imageUri: imageUri ?? undefined }, ...existing].slice(0, 30);
      await AsyncStorage.setItem("rarely.journalEntries", JSON.stringify(next));
      const draftCleared = await clearJournalDraftBestEffort(AsyncStorage);
      if (!draftCleared) {
        reportNonFatalError("journal:cleanup-draft-after-save", new Error("entry saved but draft cleanup was unavailable"));
        setDraftPersistUnavailable(true);
      }
      setDraftUpdatedAt(null);
      setDraftPrompt(null);
      setSaved(true);
      setDraftDirty(false);
      setDraftSaved(false);
      await triggerSuccessNotification().catch((error) => reportNonFatalError("journal:success-notification", error));
      setSnackbar(draftCleared ? "Entry saved to your private journal" : "Entry saved; the old draft is still on this device");
    } catch (error) {
      console.error("[Journal] Failed to save entry:", error);
      Alert.alert("Save failed", "Your entry could not be saved right now. Please try again.");
    }
  };

  const refinePrompt = (refinement: AiPromptRefinement) => {
    setPromptRefinement(refinement);
    setDraftDirty(true);
    setDraftSaved(false);
    void appendAiPromptHistory({ prompt: basePrompt, refinement }).catch((error) => { reportNonFatalError("journal:save-prompt-history", error); setAiHistoryUnavailable(true); setSnackbar("Prompt updated locally; AI history could not be saved"); });
    setSnackbar(refinement === "gentler" ? "Prompt softened locally" : refinement === "shorter" ? "Prompt shortened locally" : "Prompt made more playful locally");
  };

  const useFallbackPrompt = () => {
    setPromptRefinement(null);
    setDraftPrompt(fallbackAiPrompt("spark"));
    setDraftDirty(true);
    setDraftSaved(false);
    setAiFeedback("tryAnother");
    void appendAiPromptHistory({ prompt: fallbackAiPrompt("spark"), feedback: "tryAnother" }).catch((error) => { reportNonFatalError("journal:save-fallback-history", error); setAiHistoryUnavailable(true); setSnackbar("Private fallback ready; AI history could not be saved"); });
    setSnackbar("A private fallback prompt is ready");
  };

  const recordAiFeedback = (feedback: "useful" | "tryAnother") => {
    setAiFeedback(feedback);
    void appendAiPromptHistory({ prompt: activePrompt, refinement: promptRefinement ?? undefined, feedback }).catch((error) => { reportNonFatalError("journal:save-feedback-history", error); setAiHistoryUnavailable(true); setSnackbar("Feedback used locally; AI history could not be saved"); });
    setSnackbar(feedback === "useful" ? "Saved as a useful prompt" : "We’ll keep this prompt style fresh");
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.85 });
      if (result.canceled) return;
      const selectedUri = result.assets[0]?.uri;
      if (!selectedUri) return;
      setImageUri(selectedUri);
      setDraftDirty(true);
      setDraftSaved(false);
      setSnackbar("A private image was added to this reflection");
    } catch (error) {
      reportNonFatalError("journal:pick-image", error);
      setSnackbar("Could not access your photo library right now");
      Alert.alert("Could not add image", "We couldn't access your photo library right now. Your journal text is still safe on this device.");
    }
  };

  const updateEntry = (value: string) => {
    const trimmed = value.trim();
    setEntry(value);
    setSaved(false);
    setDraftSaved(false);
    setDraftDirty(trimmed.length > 0);
    if (!trimmed) {
      setDraftUpdatedAt(null);
      setDraftPrompt(null);
      void AsyncStorage.removeItem("rarely.journalDraft").catch((error) => {
        reportNonFatalError("journal:clear-empty-draft", error);
        setDraftPersistUnavailable(true);
        setSnackbar("Your empty draft could not be cleared from storage");
      });
      return;
    }
    const updatedAt = new Date().toISOString();
    setDraftUpdatedAt(updatedAt);
    setDraftPrompt(activePrompt);
    void AsyncStorage.setItem("rarely.journalDraft", JSON.stringify({ text: value, updatedAt, prompt: activePrompt, imageUri: imageUri ?? undefined })).catch((error) => {
      reportNonFatalError("journal:autosave-draft", error);
      setDraftPersistUnavailable(true);
      setSnackbar("Autosave is unavailable; your current words remain in this session");
    });
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <FadeInView style={styles.flex} duration={300} distance={6}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={leaveJournal} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerLabel}>PRIVATE JOURNAL</Text><View style={styles.spacer} /></View>
        <View style={styles.promptCard}><Image source={{ uri: "/manus-storage/rarely-profile-reflection_7bbb06d5.png" }} resizeMode="cover" accessibilityLabel="Reflective journal visual" style={styles.promptVisual} /><Text style={styles.promptKicker}>{recoveredPrompt ? "RECOVERED PROMPT" : promptOverride ? "CREATIVE PROMPT" : "TODAY’S PROMPT"}</Text><Text accessibilityLiveRegion="polite" style={styles.prompt}>{activePrompt}</Text>{isAiPrompt ? <><Text accessibilityRole="text" style={styles.aiPrivacy}>{getAiGovernanceDisclosure(promptSource === "private-fallback" ? "private-fallback" : "governed")}</Text><View accessibilityRole="toolbar" accessibilityLabel="Refine AI prompt" style={styles.refinements}><Pressable accessibilityRole="button" accessibilityLabel="Make AI prompt gentler" onPress={() => refinePrompt("gentler")} style={({ pressed }) => [styles.refinement, promptRefinement === "gentler" && styles.refinementSelected, pressed && styles.pressed]}><Text style={[styles.refinementText, promptRefinement === "gentler" && styles.refinementTextSelected]}>Gentler</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Make AI prompt shorter" onPress={() => refinePrompt("shorter")} style={({ pressed }) => [styles.refinement, promptRefinement === "shorter" && styles.refinementSelected, pressed && styles.pressed]}><Text style={[styles.refinementText, promptRefinement === "shorter" && styles.refinementTextSelected]}>Shorter</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Make AI prompt more playful" onPress={() => refinePrompt("morePlayful")} style={({ pressed }) => [styles.refinement, promptRefinement === "morePlayful" && styles.refinementSelected, pressed && styles.pressed]}><Text style={[styles.refinementText, promptRefinement === "morePlayful" && styles.refinementTextSelected]}>More playful</Text></Pressable></View><View style={styles.aiFeedback}><Pressable accessibilityRole="button" accessibilityState={{ selected: aiFeedback === "useful" }} accessibilityLabel="Mark this AI prompt useful" onPress={() => recordAiFeedback("useful")} style={[styles.feedbackButton, aiFeedback === "useful" && styles.feedbackSelected]}><Text style={styles.feedbackText}>{aiFeedback === "useful" ? "Useful ✓" : "Useful"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{ selected: aiFeedback === "tryAnother" }} accessibilityLabel="Ask for another AI prompt" onPress={useFallbackPrompt} style={[styles.feedbackButton, aiFeedback === "tryAnother" && styles.feedbackSelected]}><Text style={styles.feedbackText}>{aiFeedback === "tryAnother" ? "Another ✓" : "Try another"}</Text></Pressable></View><Pressable accessibilityRole="button" accessibilityLabel="Use a private fallback prompt" onPress={useFallbackPrompt} style={({ pressed }) => [styles.fallbackButton, pressed && styles.pressed]}><Text style={styles.fallbackText}>Use another private prompt</Text></Pressable></> : null}{draftUpdatedAt ? <Text accessibilityRole="text" accessibilityLabel={`Draft saved ${new Date(draftUpdatedAt).toLocaleString()}`} style={styles.promptMeta}>Draft saved {new Date(draftUpdatedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</Text> : null}{loadingDraft ? <FadeInView duration={180} distance={3}><Text accessibilityLiveRegion="polite" style={styles.promptMeta}>Checking for a private draft…</Text></FadeInView> : null}{draftLoadState === "unavailable" ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.promptMeta}>Draft status is unavailable. Your current writing is still private on this device.</Text> : null}{attachmentSkipped ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.promptMeta}>A saved attachment was skipped because it was not a local private file.</Text> : null}{aiHistoryUnavailable ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.promptMeta}>AI prompt history is temporarily unavailable. Your journal text and private images remain on this device.</Text> : null}{draftPersistUnavailable ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.promptMeta}>Draft storage is temporarily unavailable. Your current words remain in this session; try Save draft again.</Text> : null}</View>
        {imageUri ? <FadeInView duration={220} distance={5}><View style={styles.attachmentCard}><Image source={{ uri: imageUri }} accessibilityLabel="Your private journal image" resizeMode="cover" style={styles.attachmentImage} /><Pressable accessibilityRole="button" accessibilityLabel="Remove private journal image" onPress={() => { setImageUri(null); setDraftDirty(true); setDraftSaved(false); setSnackbar("Private image removed"); }} style={({ pressed }) => [styles.removeAttachment, pressed && styles.pressed]}><Text style={styles.removeAttachmentText}>Remove image</Text></Pressable></View></FadeInView> : <Pressable accessibilityRole="button" accessibilityLabel="Add a private image to this reflection" onPress={pickImage} style={({ pressed }) => [styles.addAttachment, pressed && styles.pressed]}><Text style={styles.addAttachmentText}>Add a private image</Text><Text style={styles.addAttachmentHint}>Optional · stays on this device</Text></Pressable>}
        <TextInput value={entry} onChangeText={updateEntry} placeholder="Start wherever feels honest…" placeholderTextColor="#B3A5B0" multiline textAlignVertical="top" style={styles.input} autoFocus />
        <View style={styles.bottom}><Text style={styles.privacy}>Your entry stays on this device for now.</Text><FadeInView key={draftSaved ? "draft-saved" : draftDirty ? "draft-dirty" : "draft-clean"} duration={180} distance={3}><Text accessibilityLiveRegion="polite" style={styles.draftStatus}>{draftSaved ? `Draft saved on this device${draftUpdatedAt ? ` · ${new Date(draftUpdatedAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}` : ""}` : draftDirty ? "Unsaved changes" : "No unsaved changes"}</Text></FadeInView><Text accessibilityRole="text" style={styles.count}>{characterCount} characters</Text>{draftPrompt ? <Text accessibilityRole="text" accessibilityLabel={`Prompt in use: ${draftPrompt}`} style={styles.draftContext}>Prompt in use: {draftPrompt}</Text> : null}<Pressable accessibilityRole="button" accessibilityLiveRegion="polite" accessibilityLabel="Save journal draft" accessibilityState={{ disabled: !entry.trim() }} disabled={!entry.trim()} onPress={saveDraft} style={({ pressed }) => [styles.draftButton, !entry.trim() && styles.disabled, pressed && styles.pressed]}><Text style={styles.draftButtonText}>{draftSaved ? "Draft saved ✓" : "Save draft"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLiveRegion="polite" accessibilityLabel={saved ? "Entry saved to your journal" : "Save journal entry"} accessibilityState={{ disabled: !entry.trim(), busy: false }} disabled={!entry.trim()} onPress={saveEntry} style={({ pressed }) => [styles.save, !entry.trim() && styles.disabled, pressed && styles.pressed]}><Text style={styles.saveText}>{saved ? "Saved to your journal ✓" : "Save entry"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={leaveJournal} style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}><Text style={styles.cancelText}>Go back</Text></Pressable></View>
      </KeyboardAvoidingView>
      </FadeInView>
      <Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, attachmentCard: { borderRadius: 18, backgroundColor: "#FFF7F2", borderColor: "#EDE4E0", borderWidth: 1, padding: 9, marginTop: 14 }, attachmentImage: { width: "100%", height: 120, borderRadius: 13 }, removeAttachment: { alignItems: "center", paddingVertical: 8 }, removeAttachmentText: { color: "#B96861", fontSize: 12, fontWeight: "700" }, addAttachment: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 18, padding: 13, marginTop: 14, alignItems: "center" }, addAttachmentText: { color: "#5F4A5E", fontSize: 13, fontWeight: "700" }, addAttachmentHint: { color: "#9C8D99", fontSize: 11, marginTop: 3 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 }, headerLabel: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 2 }, spacer: { width: 42 }, promptCard: { backgroundColor: "#F5D7CF", borderRadius: 24, padding: 20, overflow: "hidden" }, promptVisual: { width: "100%", height: 96, borderRadius: 17, marginBottom: 16 }, promptKicker: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 }, prompt: { color: "#2B1D2F", fontSize: 23, lineHeight: 29, fontWeight: "700", marginTop: 12 }, aiPrivacy: { color: "#5F4A5E", fontSize: 11, lineHeight: 16, marginTop: 10 }, refinements: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }, refinement: { borderColor: "#D9CBD5", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }, refinementSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" }, refinementText: { color: "#5F5262", fontSize: 11, fontWeight: "700" }, refinementTextSelected: { color: "#FFF7F2" }, aiFeedback: { flexDirection: "row", gap: 6, marginTop: 9 }, feedbackButton: { borderColor: "#D9CBD5", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }, feedbackSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" }, feedbackText: { color: "#5F5262", fontSize: 11, fontWeight: "700" }, fallbackButton: { alignSelf: "flex-start", marginTop: 9, paddingVertical: 5 }, fallbackText: { color: "#7E6F7D", fontSize: 11, fontWeight: "700", textDecorationLine: "underline" }, input: { flex: 1, color: "#2B1D2F", fontSize: 18, lineHeight: 27, paddingTop: 25, paddingHorizontal: 4 }, bottom: { paddingBottom: 8 }, draftStatus: { color: "#9C8D99", textAlign: "center", fontSize: 12, marginBottom: 5 }, count: { color: "#9C8D99", textAlign: "center", fontSize: 11, marginBottom: 8 }, draftContext: { color: "#9C8D99", textAlign: "center", fontSize: 11, lineHeight: 16, marginBottom: 9 }, promptMeta: { color: "#7E6F7D", fontSize: 11, lineHeight: 16, marginTop: 12 }, draftButton: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 18, paddingVertical: 14, alignItems: "center", marginBottom: 9 }, draftButtonText: { color: "#5F4A5E", fontSize: 14, fontWeight: "700" }, privacy: { color: "#9C8D99", textAlign: "center", fontSize: 12, marginBottom: 12 }, save: { backgroundColor: "#2B1D2F", borderRadius: 18, paddingVertical: 16, alignItems: "center" }, disabled: { opacity: 0.4 }, pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] }, saveText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" }, cancel: { alignItems: "center", paddingVertical: 15 }, cancelText: { color: "#7E6F7D", fontSize: 14, fontWeight: "600" }, });
