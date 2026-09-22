import { useEffect, useMemo, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { FadeInView } from "@/components/ui/fade-in-view";
import { Snackbar } from "@/components/ui/snackbar";
import { trpc } from "@/lib/trpc";
import { reportNonFatalError } from "@/lib/non-fatal-error";
import { RecoveryCard } from "@/components/ui/recovery-card";
import { safeJsonParse } from "@/lib/utils";

type Mode = "vision" | "manifestation" | "moodboard";
type CreativeImage = { uri: string; label: string };
type CreativeResult = { title: string; summary: string; lines: string[]; palette: string[]; source: "ai" | "fallback"; tiles?: string[]; images?: CreativeImage[] };
type SavedBoard = CreativeResult & { mode: Mode; direction: string; savedAt: string; favorite?: boolean };
type SavedSynthesis = { text: string; boardTitles: string[]; savedAt: string; favorite?: boolean };

const modes: { id: Mode; label: string; description: string }[] = [
  { id: "vision", label: "Vision board", description: "Turn a direction into images, words, and a next step." },
  { id: "manifestation", label: "Manifestation", description: "Write a grounded intention without making promises about the future." },
  { id: "moodboard", label: "Moodboard", description: "Find a palette, texture, and rhythm for the feeling you want." },
];

const fallback: Record<Mode, CreativeResult> = {
  vision: { title: "A vision with room to breathe", summary: "Collect images, words, and textures that make your next season feel possible.", lines: ["One image of how I want to feel", "One texture that represents the next chapter", "One small action I can take this week"], palette: ["#F5D7CF", "#D9CDE7", "#D8E1D5"], source: "fallback" },
  manifestation: { title: "A grounded promise to yourself", summary: "Write toward the feeling you want to practice, without pretending everything is under your control.", lines: ["I am making space for…", "I can practice this by…", "I do not have to rush the becoming."], palette: ["#F5D7CF", "#D9CDE7", "#D8E1D5"], source: "fallback" },
  moodboard: { title: "A mood in three layers", summary: "Let color, texture, and rhythm describe the atmosphere before you explain it.", lines: ["Palette: one warm, one quiet, one surprising tone", "Texture: something soft beside something unfinished", "Sound: a rhythm that gives the room more air"], palette: ["#F5D7CF", "#D9CDE7", "#D8E1D5"], source: "fallback" },
};

export default function CreativeLabScreen() {
  const [mode, setMode] = useState<Mode>("vision");
  const [direction, setDirection] = useState("");
  const [result, setResult] = useState<CreativeResult | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [loadWarning, setLoadWarning] = useState<string | null>(null);
  const [loadingLocal, setLoadingLocal] = useState(true);
  const [preferencesUnavailable, setPreferencesUnavailable] = useState(false);
  const [loadToken, setLoadToken] = useState(0);
  const [tileDraft, setTileDraft] = useState("");
  const [tiles, setTiles] = useState<string[]>([]);
  const [images, setImages] = useState<CreativeImage[]>([]);
  const [visualUrl, setVisualUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<SavedBoard[]>([]);
  const [renamingAt, setRenamingAt] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [synthesis, setSynthesis] = useState<string | null>(null);
  const [synthesisHistory, setSynthesisHistory] = useState<SavedSynthesis[]>([]);
  const [historyFilter, setHistoryFilter] = useState<Mode | "all">("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [aiRecovery, setAiRecovery] = useState<"text" | "visual" | "synthesis" | null>(null);
  const [unsavedBoard, setUnsavedBoard] = useState<CreativeResult | null>(null);
  const [savingBoard, setSavingBoard] = useState(false);
  const [unsavedSynthesis, setUnsavedSynthesis] = useState<{ text: string; boardTitles: string[] } | null>(null);
  const [savingSynthesis, setSavingSynthesis] = useState(false);
  const [unsavedVisual, setUnsavedVisual] = useState<string | null>(null);
  const [savingVisual, setSavingVisual] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);
  const generate = trpc.creative.generate.useMutation();
  const generateVisual = trpc.creative.generateVisual.useMutation();
  const synthesize = trpc.creative.synthesize.useMutation();

  useEffect(() => {
    setLoadingLocal(true);
    void AsyncStorage.getItem("rarely.preferences").then((raw) => {
      const value = safeJsonParse<Record<string, unknown>>(raw, {});
      const labels: Record<string, string> = { creativity: "creative ideas", journaling: "journaling", music: "music discovery", community: "positive community", beauty: "beauty rituals" };
      setPreferences(Object.entries(labels).filter(([key]) => Number(value[key]) > 0.7).map(([, label]) => label));
      setPreferencesUnavailable(false);
    }).catch((error) => { reportNonFatalError("creative-lab:load-preferences", error); setPreferencesUnavailable(true); setLoadWarning("Personalization is unavailable for now; your private creative flow still works."); });
    void AsyncStorage.getItem("rarely.creativeLab.history").then((raw) => {
      if (!raw) { setHistory([]); return; }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("saved board history payload was not a list");
      setHistory(parsed.filter((item): item is SavedBoard => Boolean(item) && typeof item === "object" && typeof (item as SavedBoard).title === "string").slice(0, 6));
    }).catch((error) => { reportNonFatalError("creative-lab:load-history", error); setHistory([]); setLoadWarning("Saved boards were unreadable; a private starter remains available."); });
    void AsyncStorage.getItem("rarely.creativeLab.syntheses").then((raw) => {
      if (!raw) { setSynthesisHistory([]); return; }
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("saved synthesis payload was not a list");
      setSynthesisHistory(parsed.filter((item): item is SavedSynthesis => Boolean(item) && typeof item === "object" && typeof (item as SavedSynthesis).text === "string").slice(0, 6));
    }).catch((error) => { reportNonFatalError("creative-lab:load-syntheses", error); setSynthesisHistory([]); setLoadWarning("Saved syntheses were unreadable; new comparisons can still use local fallback content."); });
    void AsyncStorage.getItem("rarely.creativeLab.visual").then((raw) => {
      if (!raw) return;
      if (!raw.startsWith("http://") && !raw.startsWith("https://") && !raw.startsWith("file://") && !raw.startsWith("/")) throw new Error("saved visual reference was invalid");
      setVisualUrl(raw);
    }).catch((error) => { reportNonFatalError("creative-lab:load-visual", error); setLoadWarning("Saved visual was unavailable; your text direction is still safe on this device."); });
    void AsyncStorage.getItem("rarely.creativeLab.last").then((raw) => {
      if (!raw) return;
      const saved: unknown = JSON.parse(raw);
      if (!saved || typeof saved !== "object" || !Array.isArray((saved as CreativeResult).lines) || !Array.isArray((saved as CreativeResult).palette)) throw new Error("saved creative result payload was invalid");
      const validResult = saved as CreativeResult;
      setResult(validResult); setTiles(Array.isArray(validResult.tiles) ? validResult.tiles : validResult.lines); setImages(Array.isArray(validResult.images) ? validResult.images.filter((image): image is CreativeImage => Boolean(image && typeof image.uri === "string" && (image.uri.startsWith("file://") || image.uri.startsWith("/")))) : []);
    }).catch((error) => { reportNonFatalError("creative-lab:load-result", error); const starter = { ...fallback.vision, tiles: fallback.vision.lines }; setResult(starter); setTiles(starter.tiles ?? []); setSnackbar("Saved creative content was unreadable. A private starter is ready."); }).finally(() => setLoadingLocal(false));
  }, [loadToken]);

  const retryLoad = () => { setLoadingLocal(true); setLoadWarning(null); setSnackbar("Refreshing private creative data…"); setLoadToken((value) => value + 1); };
  const handleVisualError = () => { reportNonFatalError("creative-lab:render-visual", new Error("saved visual could not be rendered")); setVisualUrl(null); setLoadWarning("This saved visual could not be displayed. Your text direction remains available."); };
  const confirmRemoveVisual = () => Alert.alert("Remove this AI visual?", "This clears only the saved AI visual reference from this device. Your text direction and private board images will remain unchanged.", [
    { text: "Keep visual", style: "cancel" },
    { text: "Remove visual", style: "destructive", onPress: () => {
      void AsyncStorage.removeItem("rarely.creativeLab.visual").then(() => {
        setVisualUrl(null);
        setUnsavedVisual(null);
        setSnackbar("AI visual removed from this device");
      }).catch((error) => {
        reportNonFatalError("creative-lab:remove-visual", error);
        setSnackbar("Could not remove the AI visual reference");
      });
    } },
  ]);

  const activeMode = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode]);
  const visibleHistory = useMemo(() => history.filter((item) => (historyFilter === "all" || item.mode === historyFilter) && (!favoritesOnly || item.favorite)), [favoritesOnly, history, historyFilter]);
  const saveBoard = async (board: CreativeResult) => {
    const saved: SavedBoard = { ...board, mode, direction, savedAt: new Date().toISOString() };
    const nextHistory = [saved, ...history.filter((item) => item.title !== saved.title)].slice(0, 6);
    await AsyncStorage.multiSet([["rarely.creativeLab.last", JSON.stringify(saved)], ["rarely.creativeLab.history", JSON.stringify(nextHistory)]]);
    setHistory(nextHistory);
  };
  const toggleBoardFavorite = async (savedAt: string) => {
    const next = history.map((item) => item.savedAt === savedAt ? { ...item, favorite: !item.favorite } : item);
    try { await updateHistory(next); } catch (error) { reportNonFatalError("creative-lab:favorite-board", error); setSnackbar("Could not update this favorite"); }
  };
  const toggleSynthesisFavorite = async (savedAt: string) => {
    const next = synthesisHistory.map((item) => item.savedAt === savedAt ? { ...item, favorite: !item.favorite } : item);
    try { await AsyncStorage.setItem("rarely.creativeLab.syntheses", JSON.stringify(next)); setSynthesisHistory(next); } catch (error) { reportNonFatalError("creative-lab:favorite-synthesis", error); setSnackbar("Could not update this favorite"); }
  };
  const confirmDeleteSynthesis = (savedAt: string, boardTitles: string[]) => Alert.alert("Remove this synthesis?", `This clears the saved comparison for ${boardTitles.join(" and ")} from this device. Your boards will remain unchanged.`, [
    { text: "Keep synthesis", style: "cancel" },
    { text: "Remove synthesis", style: "destructive", onPress: () => {
      const next = synthesisHistory.filter((item) => item.savedAt !== savedAt);
      void AsyncStorage.setItem("rarely.creativeLab.syntheses", JSON.stringify(next)).then(() => {
        setSynthesisHistory(next);
        setSnackbar("Synthesis removed from this device");
      }).catch((error) => {
        reportNonFatalError("creative-lab:delete-synthesis", error, { savedAt });
        setSnackbar("Could not remove this synthesis");
      });
    } },
  ]);
  const updateHistory = async (nextHistory: SavedBoard[]) => {
    await AsyncStorage.setItem("rarely.creativeLab.history", JSON.stringify(nextHistory));
    setHistory(nextHistory);
  };
  const persistBoard = async (board: CreativeResult): Promise<boolean> => {
    setSavingBoard(true);
    try {
      await saveBoard(board);
      setUnsavedBoard(null);
      return true;
    } catch (error) {
      reportNonFatalError("creative-lab:save-result", error);
      setUnsavedBoard(board);
      setSnackbar("This direction is ready, but local saving is unavailable.");
      return false;
    } finally {
      setSavingBoard(false);
    }
  };
  const create = async () => {
    const trimmed = direction.trim();
    if (!trimmed || generate.isPending) return;
    try {
      const next = await generate.mutateAsync({ mode, direction: trimmed, preferences });
      const withTiles = { ...next, tiles: tiles.length ? tiles : next.lines };
      setResult(withTiles);
      setTiles(withTiles.tiles ?? []);
      const persisted = { ...withTiles, images };
      setResult(persisted);
      if (!(await persistBoard(persisted))) return;
      setAiRecovery(null);
      setSnackbar(next.source === "ai" ? "Creative direction made with Rare AI" : "AI is resting. A private starter is ready instead.");
    } catch (error) {
      reportNonFatalError("creative-lab:generate", error, { mode });
      const next = { ...fallback[mode], tiles: tiles.length ? tiles : fallback[mode].lines };
      setResult(next);
      setTiles(next.tiles ?? []);
      setAiRecovery("text");
      if (!(await persistBoard(next))) return;
      setSnackbar("AI is unavailable. A private starter is ready instead.");
    }
  };

  const createVisual = async () => {
    const trimmed = direction.trim();
    if (!trimmed || generateVisual.isPending) return;
    try {
      const next = await generateVisual.mutateAsync({ mode, direction: trimmed });
      if (!next.url) throw new Error("Visual generation returned no image URL");
      setVisualUrl(next.url);
      setAiRecovery(null);
      const saved = await persistVisual(next.url);
      if (saved) setSnackbar("AI visual added to your board");
    } catch (error) {
      reportNonFatalError("creative-lab:generate-visual", error, { mode });
      setAiRecovery("visual");
      setSnackbar("Visual AI is unavailable. Your text board is still ready.");
    }
  };

  const saveSynthesis = async (text: string, boardTitles: string[]) => {
    const saved: SavedSynthesis = { text, boardTitles, savedAt: new Date().toISOString() };
    const next = [saved, ...synthesisHistory].slice(0, 6);
    await AsyncStorage.setItem("rarely.creativeLab.syntheses", JSON.stringify(next));
    setSynthesisHistory(next);
  };
  const persistSynthesis = async (text: string, boardTitles: string[]): Promise<boolean> => {
    setSavingSynthesis(true);
    try {
      await saveSynthesis(text, boardTitles);
      setUnsavedSynthesis(null);
      return true;
    } catch (error) {
      reportNonFatalError("creative-lab:save-synthesis", error);
      setUnsavedSynthesis({ text, boardTitles });
      setSnackbar("Synthesis is ready, but local saving is unavailable.");
      return false;
    } finally {
      setSavingSynthesis(false);
    }
  };
  const persistVisual = async (url: string): Promise<boolean> => {
    setSavingVisual(true);
    try {
      await AsyncStorage.setItem("rarely.creativeLab.visual", url);
      setUnsavedVisual(null);
      return true;
    } catch (error) {
      reportNonFatalError("creative-lab:save-visual", error);
      setUnsavedVisual(url);
      setSnackbar("AI visual is ready, but local saving is unavailable.");
      return false;
    } finally {
      setSavingVisual(false);
    }
  };
  const compareBoards = async () => {
    if (compareIds.length !== 2 || synthesize.isPending) return;
    const selected = compareIds.map((id) => history.find((item) => item.savedAt === id)).filter((item): item is SavedBoard => Boolean(item));
    if (selected.length !== 2) return;
    try {
      const response = await synthesize.mutateAsync({ first: { title: selected[0].title, mode: selected[0].mode, lines: selected[0].lines }, second: { title: selected[1].title, mode: selected[1].mode, lines: selected[1].lines } });
      setSynthesis(response.text);
      setAiRecovery(null);
      try {
        if (!(await persistSynthesis(response.text, selected.map((item) => item.title)))) return;
      } catch (saveError) {
        reportNonFatalError("creative-lab:save-synthesis", saveError);
        setUnsavedSynthesis({ text: response.text, boardTitles: selected.map((item) => item.title) });
        setSnackbar("Grounded synthesis is ready, but could not be saved locally.");
        return;
      }
      setSnackbar("A grounded synthesis is ready");
    } catch (error) {
      reportNonFatalError("creative-lab:synthesize", error, { count: selected.length });
      const localSynthesis = `${selected[0].title} and ${selected[1].title} share a creative thread. Keep the smallest next step that feels useful.`;
      setSynthesis(localSynthesis);
      setAiRecovery("synthesis");
      try { await saveSynthesis(localSynthesis, selected.map((item) => item.title)); } catch (saveError) { reportNonFatalError("creative-lab:save-synthesis-fallback", saveError); }
      setSnackbar("AI is unavailable. A private comparison is ready instead.");
    }
  };

  const addImages = async () => {
    try {
      const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsMultipleSelection: true, selectionLimit: 6, quality: 0.8 });
      if (picked.canceled) return;
      const nextImages = [...images, ...picked.assets.map((asset, index) => ({ uri: asset.uri, label: `Private board image ${images.length + index + 1}` })).filter((image) => image.uri.startsWith("file://") || image.uri.startsWith("/"))].slice(-6);
      setImages(nextImages);
      if (result) { const next = { ...result, images: nextImages }; setResult(next); await AsyncStorage.setItem("rarely.creativeLab.last", JSON.stringify(next)); }
      setSnackbar("Private images added to this board");
    } catch (error) { reportNonFatalError("creative-lab:add-images", error); setSnackbar("Could not add images right now"); }
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back to Create" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.eyebrow}>RARE AI / CREATIVE LAB</Text><Pressable accessibilityRole="button" accessibilityLabel="Open your creative library" onPress={() => router.push("/creative-library" as never)} style={({ pressed }) => [styles.libraryLink, pressed && styles.pressed]}><Text style={styles.libraryLinkText}>Library</Text></Pressable></View>
      <FadeInView duration={300} distance={8}><Text style={styles.title}>Make a world you want to return to.</Text><Text style={styles.subtitle}>A private creative studio for visual direction, grounded intention, and atmosphere. Only your short direction and broad preferences are used.</Text>{loadingLocal ? <FadeInView duration={180} distance={3}><Text accessibilityLiveRegion="polite" style={styles.loadingState}>Restoring your private creative space…</Text></FadeInView> : null}{loadWarning ? <View><Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.loadWarning}>{loadWarning}</Text><Pressable accessibilityRole="button" accessibilityLabel={preferencesUnavailable ? "Retry loading Creative Lab personalization" : "Retry loading Creative Lab data"} onPress={retryLoad} style={({ pressed }) => [styles.retryLoad, pressed && styles.pressed]}><Text style={styles.retryLoadText}>{preferencesUnavailable ? "Retry personalization" : "Retry local data"}</Text></Pressable></View> : null}</FadeInView>
      <View accessibilityRole="radiogroup" accessibilityLabel="Creative mode" style={styles.modes}>{modes.map((item) => <Pressable key={item.id} accessibilityRole="radio" accessibilityLabel={`${item.label}: ${item.description}`} accessibilityState={{ selected: mode === item.id }} onPress={() => setMode(item.id)} style={({ pressed }) => [styles.mode, mode === item.id && styles.modeSelected, pressed && styles.pressed]}><Text style={[styles.modeLabel, mode === item.id && styles.modeLabelSelected]}>{item.label}</Text><Text style={[styles.modeDescription, mode === item.id && styles.modeDescriptionSelected]}>{item.description}</Text></Pressable>)}</View>
      <Text style={styles.kicker}>{activeMode.label.toUpperCase()}</Text>
      <TextInput accessibilityLabel="Creative direction" value={direction} onChangeText={setDirection} placeholder="What feeling, season, or possibility are you exploring?" placeholderTextColor="#9C8D99" multiline maxLength={240} style={styles.input} />
      <Text style={styles.counter}>{direction.length}/240 · Your private journal and images stay on this device.</Text>
      {aiRecovery === "text" ? <RecoveryCard title="Private starter mode" message="Rare AI could not complete this direction. The visible result is local starter content, not a prediction or personal inference." retryLabel="Retry direction" onRetry={() => void create()} /> : null}
      {aiRecovery === "visual" ? <RecoveryCard title="Visual AI unavailable" message="The text direction remains ready. No private images were uploaded or sent to the visual model." retryLabel="Retry visual" onRetry={() => void createVisual()} /> : null}
      {aiRecovery === "synthesis" ? <RecoveryCard title="Private comparison mode" message="AI could not compare these boards, so the visible synthesis is a local, deterministic summary using only saved board titles." retryLabel="Retry synthesis" onRetry={() => void compareBoards()} /> : null}
      {unsavedBoard ? <RecoveryCard title="Direction ready to save" message="The result is still available in this session. It was not saved locally yet, and no new AI request is needed." retryLabel={savingBoard ? "Saving…" : "Save again"} onRetry={() => { if (!savingBoard) void persistBoard(unsavedBoard); }} /> : null}
      {unsavedSynthesis ? <RecoveryCard title="Synthesis ready to save" message="The comparison is still available in this session. Saving again will not call AI or change your selected boards." retryLabel={savingSynthesis ? "Saving…" : "Save synthesis"} onRetry={() => { if (!savingSynthesis) void persistSynthesis(unsavedSynthesis.text, unsavedSynthesis.boardTitles); }} /> : null}
      {unsavedVisual ? <RecoveryCard title="Visual ready to save" message="The generated visual is still available in this session. Saving again only stores its reference on this device." retryLabel={savingVisual ? "Saving…" : "Save visual"} onRetry={() => { if (!savingVisual) void persistVisual(unsavedVisual); }} /> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={`Create ${activeMode.label}`} accessibilityState={{ disabled: !direction.trim() || savingBoard, busy: generate.isPending }} disabled={!direction.trim() || generate.isPending || savingBoard} onPress={() => void create()} style={({ pressed }) => [styles.primary, (!direction.trim() || generate.isPending || savingBoard) && styles.disabled, pressed && styles.pressed]}><Text style={styles.primaryText}>{generate.isPending ? "Making space…" : `Create ${activeMode.label}`}</Text><Text style={styles.arrow}>→</Text></Pressable>
      {result ? <FadeInView key={`${result.title}-${result.source}`} duration={320} distance={8}><View accessibilityLiveRegion="polite" style={styles.result}><View style={styles.resultHeader}><Text style={styles.resultKicker}>{result.source === "ai" ? "RARE AI DIRECTION" : "MOCK DATA PREVIEW"}</Text><Text style={styles.spark}>✦</Text></View><Text style={styles.resultTitle}>{result.title}</Text><Text style={styles.resultSummary}>{result.summary}</Text>{result.source === "fallback" ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.mockNotice}>Mock data preview: AI was unavailable, so this starter was created locally from a fixed template. No private journal text or images were sent.</Text> : null}<View style={styles.palette}>{result.palette.map((color) => <View key={color} accessibilityLabel={`Palette color ${color}`} style={[styles.swatch, { backgroundColor: color }]} />)}</View>{result.lines.map((line, index) => <View key={`${line}-${index}`} style={styles.line}><Text style={styles.lineNumber}>{String(index + 1).padStart(2, "0")}</Text><Text style={styles.lineText}>{line}</Text></View>)}<Text style={styles.disclosure}>AI offers possibilities, not predictions. Keep what feels useful and leave the rest.</Text><Text style={styles.tileHeading}>MAKE IT YOURS</Text><Text style={styles.tileHint}>Add a word, image idea, or texture. These tiles stay on this device.</Text><View style={styles.tileComposer}><TextInput accessibilityLabel="Add a private board tile" value={tileDraft} onChangeText={setTileDraft} placeholder="e.g. morning light" placeholderTextColor="#9C8D99" maxLength={60} style={styles.tileInput} /><Pressable accessibilityRole="button" accessibilityLabel="Add private board tile" disabled={!tileDraft.trim()} onPress={() => { const nextTiles = [...tiles, tileDraft.trim()].slice(-12); setTiles(nextTiles); setTileDraft(""); const next = { ...result, tiles: nextTiles }; setResult(next); void saveBoard(next).catch((error) => { reportNonFatalError("creative-lab:save-tile", error); setSnackbar("Tile added in this session, but could not be saved"); }); }} style={({ pressed }) => [styles.tileAdd, !tileDraft.trim() && styles.disabled, pressed && styles.pressed]}><Text style={styles.tileAddText}>Add</Text></Pressable></View><View style={styles.tiles}>{(result.tiles ?? tiles).map((tile, index) => <View key={`${tile}-${index}`} style={[styles.tile, { backgroundColor: result.palette[index % result.palette.length] }]}><Text style={styles.tileText}>{tile}</Text></View>)}</View><Pressable accessibilityRole="button" accessibilityLabel={`Generate an AI visual for this ${activeMode.label}`} accessibilityState={{ busy: generateVisual.isPending }} disabled={generateVisual.isPending || !direction.trim()} onPress={() => void createVisual()} style={({ pressed }) => [styles.imageButton, (generateVisual.isPending || !direction.trim()) && styles.disabled, pressed && styles.pressed]}><Text style={styles.imageButtonText}>{generateVisual.isPending ? "Composing visual…" : "Generate AI visual"}</Text><Text style={styles.imageButtonHint}>Uses only your short direction, never private images.</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Add private images to this board" onPress={() => void addImages()} style={({ pressed }) => [styles.imageButton, pressed && styles.pressed]}><Text style={styles.imageButtonText}>Add private images</Text><Text style={styles.imageButtonHint}>Nothing is uploaded or sent to AI.</Text></Pressable>{visualUrl ? <FadeInView duration={280} distance={5}><View><Image source={{ uri: visualUrl }} accessibilityLabel={`AI-generated ${activeMode.label} visual`} onError={handleVisualError} resizeMode="cover" style={styles.generatedVisual} /><Text style={styles.visualProvenance}>Generated from your short direction only · private board images stay on this device.</Text><View style={styles.visualActions}><Pressable accessibilityRole="button" accessibilityLabel={`Generate a replacement visual for this ${activeMode.label}`} onPress={() => void createVisual()} style={({ pressed }) => [styles.visualAction, pressed && styles.pressed]}><Text style={styles.visualActionText}>Replace visual</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Remove saved AI visual" onPress={confirmRemoveVisual} style={({ pressed }) => [styles.visualAction, styles.visualRemove, pressed && styles.pressed]}><Text style={styles.visualRemoveText}>Remove</Text></Pressable></View></View></FadeInView> : null}{history.length ? <View style={styles.history}><Text style={styles.tileHeading}>RECENT BOARDS</Text><View style={styles.filterRow}>{[{ id: "all" as const, label: "All" }, ...modes.map((item) => ({ id: item.id, label: item.label }))].map((filter) => <Pressable key={filter.id} accessibilityRole="button" accessibilityLabel={`Filter boards by ${filter.label}`} accessibilityState={{ selected: historyFilter === filter.id }} onPress={() => setHistoryFilter(filter.id)} style={({ pressed }) => [styles.filter, historyFilter === filter.id && styles.filterSelected, pressed && styles.pressed]}><Text style={[styles.filterText, historyFilter === filter.id && styles.filterTextSelected]}>{filter.label}</Text></Pressable>)}</View><Pressable accessibilityRole="checkbox" accessibilityLabel="Show favorite boards only" accessibilityState={{ checked: favoritesOnly }} onPress={() => setFavoritesOnly((value) => !value)} style={styles.favoriteFilter}><Text style={styles.favoriteFilterText}>{favoritesOnly ? "★ Favorites only" : "☆ Show favorites only"}</Text></Pressable><Text style={styles.tileHint}>Select two to compare their creative direction.</Text>{compareIds.length === 2 ? <View style={styles.previewRow}>{compareIds.map((id) => history.find((item) => item.savedAt === id)).filter((item): item is SavedBoard => Boolean(item)).map((board) => <View key={board.savedAt} style={styles.previewCard}><Text style={styles.previewMode}>{modes.find((item) => item.id === board.mode)?.label}</Text><Text style={styles.previewTitle}>{board.title}</Text><Text style={styles.previewLine}>{board.lines[0]}</Text></View>)}</View> : null}{compareIds.length === 2 ? <Pressable accessibilityRole="button" accessibilityLabel="Synthesize the selected boards" accessibilityState={{ busy: synthesize.isPending }} onPress={() => void compareBoards()} style={({ pressed }) => [styles.compareButton, pressed && styles.pressed]}><Text style={styles.compareButtonText}>{synthesize.isPending ? "Finding the thread…" : "Synthesize selected boards"}</Text></Pressable> : null}{synthesis ? <FadeInView duration={280} distance={6}><View accessibilityLiveRegion="polite" style={styles.synthesis}><Text style={styles.resultKicker}>PRIVATE SYNTHESIS</Text><Text style={styles.synthesisText}>{synthesis}</Text></View></FadeInView> : null}{synthesisHistory.length ? <View style={styles.synthesisHistory}><Text style={styles.tileHeading}>PAST SYNTHESIS</Text>{synthesisHistory.map((item) => <Pressable key={item.savedAt} accessibilityRole="button" accessibilityLabel={`Restore synthesis for ${item.boardTitles.join(" and ")}`} onPress={() => setSynthesis(item.text)} style={({ pressed }) => [styles.synthesisHistoryItem, pressed && styles.pressed]}><View style={styles.synthesisHistoryHeader}><Text style={styles.synthesisHistoryMeta}>{item.boardTitles.join(" + ")}</Text><Pressable accessibilityRole="button" accessibilityLabel={item.favorite ? "Remove synthesis from favorites" : "Favorite this synthesis"} onPress={() => void toggleSynthesisFavorite(item.savedAt)}><Text style={styles.favoriteGlyph}>{item.favorite ? "★" : "☆"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Remove synthesis for ${item.boardTitles.join(" and ")}`} onPress={() => confirmDeleteSynthesis(item.savedAt, item.boardTitles)}><Text style={styles.synthesisDeleteGlyph}>×</Text></Pressable></View><Text style={styles.synthesisHistoryText} numberOfLines={2}>{item.text}</Text></Pressable>)}</View> : null}<Text style={styles.tileHint}>Saved only on this device.</Text>{visibleHistory.map((board) => <View key={board.savedAt} style={styles.historyItem}><Pressable accessibilityRole="checkbox" accessibilityLabel={`Select ${board.title} for comparison`} accessibilityState={{ checked: compareIds.includes(board.savedAt) }} onPress={() => setCompareIds((current) => current.includes(board.savedAt) ? current.filter((id) => id !== board.savedAt) : current.length < 2 ? [...current, board.savedAt] : current)} style={({ pressed }) => [styles.compareCheck, compareIds.includes(board.savedAt) && styles.compareCheckSelected, pressed && styles.pressed]}><Text style={styles.compareCheckText}>{compareIds.includes(board.savedAt) ? "Selected" : "Compare"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Restore ${board.title}`} onPress={() => { setMode(board.mode); setDirection(board.direction); setResult(board); setTiles(board.tiles ?? board.lines); setImages(board.images ?? []); setSnackbar("Board restored"); }} style={({ pressed }) => [pressed && styles.pressed]}><Text style={styles.historyTitle}>{board.title}</Text><Text style={styles.historyMeta}>{modes.find((item) => item.id === board.mode)?.label ?? "Creative board"} · {new Date(board.savedAt).toLocaleDateString()}</Text></Pressable>{renamingAt === board.savedAt ? <View style={styles.renameRow}><TextInput accessibilityLabel="New board name" value={renameDraft} onChangeText={setRenameDraft} maxLength={70} style={styles.renameInput} /><Pressable accessibilityRole="button" accessibilityLabel="Save board name" disabled={!renameDraft.trim()} onPress={() => { const nextTitle = renameDraft.trim(); const nextHistory = history.map((item) => item.savedAt === board.savedAt ? { ...item, title: nextTitle } : item); void updateHistory(nextHistory).then(() => { if (result?.title === board.title) setResult({ ...result, title: nextTitle }); setRenamingAt(null); setSnackbar("Board renamed"); }).catch((error) => { reportNonFatalError("creative-lab:rename-board", error); setSnackbar("Could not rename this board"); }); }} style={({ pressed }) => [styles.smallAction, !renameDraft.trim() && styles.disabled, pressed && styles.pressed]}><Text style={styles.smallActionText}>Save</Text></Pressable></View> : <View style={styles.historyActions}><Pressable accessibilityRole="button" accessibilityLabel={board.favorite ? `Remove ${board.title} from favorites` : `Favorite ${board.title}`} onPress={() => void toggleBoardFavorite(board.savedAt)} style={({ pressed }) => [styles.smallAction, board.favorite && styles.favoriteSelectedAction, pressed && styles.pressed]}><Text style={styles.smallActionText}>{board.favorite ? "★ Saved" : "☆ Save"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Rename ${board.title}`} onPress={() => { setRenamingAt(board.savedAt); setRenameDraft(board.title); }} style={({ pressed }) => [styles.smallAction, pressed && styles.pressed]}><Text style={styles.smallActionText}>Rename</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Delete ${board.title}`} onPress={() => { const nextHistory = history.filter((item) => item.savedAt !== board.savedAt); void updateHistory(nextHistory).then(() => setSnackbar("Board removed from this device")).catch((error) => { reportNonFatalError("creative-lab:delete-board", error); setSnackbar("Could not remove this board"); }); }} style={({ pressed }) => [styles.smallAction, styles.deleteAction, pressed && styles.pressed]}><Text style={styles.deleteText}>Delete</Text></Pressable></View>}</View>)}</View> : null}{(result.images ?? images).length ? <View style={styles.imageGrid}>{(result.images ?? images).map((image) => <Image key={image.uri} source={{ uri: image.uri }} accessibilityLabel={image.label} resizeMode="cover" style={styles.boardImage} />)}</View> : null}</View></FadeInView> : null}
    </ScrollView><FadeInView key={snackbar ?? "no-feedback"} duration={180} distance={3}><Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} /></FadeInView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }, back: { width: 40 }, backText: { color: "#2B1D2F", fontSize: 36, lineHeight: 36 }, eyebrow: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 1.8 }, spacer: { width: 40 }, libraryLink: { paddingVertical: 6, paddingHorizontal: 4 }, libraryLinkText: { color: "#7E4E54", fontSize: 12, fontWeight: "700" }, title: { color: "#2B1D2F", fontSize: 34, fontWeight: "700", lineHeight: 39 }, subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 22, marginTop: 12 }, loadingState: { color: "#7E4E54", fontSize: 12, lineHeight: 18, marginTop: 10 }, loadWarning: { color: "#A34C4C", fontSize: 12, lineHeight: 18, marginTop: 10 }, retryLoad: { alignSelf: "flex-start", backgroundColor: "#2B1D2F", borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8, marginTop: 8 }, retryLoadText: { color: "#FFF7F2", fontSize: 12, fontWeight: "700" }, modes: { gap: 10, marginTop: 26 }, mode: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 17, padding: 15 }, modeSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" }, modeLabel: { color: "#2B1D2F", fontSize: 15, fontWeight: "700" }, modeLabelSelected: { color: "#FFF7F2" }, modeDescription: { color: "#7E6F7D", fontSize: 13, lineHeight: 18, marginTop: 4 }, modeDescriptionSelected: { color: "#EBDDD8" }, kicker: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 1.7, marginTop: 28, marginBottom: 10 }, input: { minHeight: 108, borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 18, padding: 16, color: "#2B1D2F", backgroundColor: "#FFFFFF", fontSize: 16, lineHeight: 23, textAlignVertical: "top" }, counter: { color: "#9C8D99", fontSize: 12, lineHeight: 18, marginTop: 8 }, primary: { backgroundColor: "#2B1D2F", borderRadius: 18, padding: 17, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 18 }, disabled: { opacity: 0.5 }, primaryText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" }, arrow: { color: "#FFF7F2", fontSize: 21 }, result: { backgroundColor: "#F5D7CF", borderRadius: 24, padding: 20, marginTop: 22 }, resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, resultKicker: { color: "#7E4E54", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 }, spark: { color: "#E96F61", fontSize: 22 }, resultTitle: { color: "#2B1D2F", fontSize: 24, fontWeight: "700", lineHeight: 29, marginTop: 14 }, resultSummary: { color: "#5F4A5E", fontSize: 14, lineHeight: 20, marginTop: 8 }, mockNotice: { color: "#7E4E54", fontSize: 12, lineHeight: 18, marginTop: 10, padding: 10, backgroundColor: "#F9E8E1", borderRadius: 12 }, palette: { flexDirection: "row", gap: 8, marginTop: 18, marginBottom: 16 }, swatch: { width: 34, height: 34, borderRadius: 17, borderColor: "#FFF7F2", borderWidth: 2 }, line: { flexDirection: "row", gap: 12, paddingVertical: 11, borderTopColor: "#EBC9C1", borderTopWidth: 1 }, lineNumber: { color: "#A06A70", fontSize: 11, fontWeight: "800", paddingTop: 2 }, lineText: { flex: 1, color: "#2B1D2F", fontSize: 15, lineHeight: 20 }, disclosure: { color: "#7E4E54", fontSize: 12, lineHeight: 18, marginTop: 12 }, tileHeading: { color: "#7E4E54", fontSize: 10, fontWeight: "800", letterSpacing: 1.5, marginTop: 20 }, tileHint: { color: "#7E4E54", fontSize: 12, lineHeight: 18, marginTop: 5 }, tileComposer: { flexDirection: "row", gap: 8, marginTop: 10 }, tileInput: { flex: 1, minHeight: 42, backgroundColor: "#FFF7F2", borderRadius: 12, paddingHorizontal: 12, color: "#2B1D2F", fontSize: 14 }, tileAdd: { backgroundColor: "#2B1D2F", borderRadius: 12, paddingHorizontal: 14, justifyContent: "center" }, tileAddText: { color: "#FFF7F2", fontSize: 13, fontWeight: "700" }, tiles: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, tile: { borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9, maxWidth: "100%" }, tileText: { color: "#2B1D2F", fontSize: 13, fontWeight: "600" }, imageButton: { marginTop: 14, borderColor: "#A06A70", borderWidth: 1, borderRadius: 13, padding: 12 }, imageButtonText: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" }, imageButtonHint: { color: "#7E4E54", fontSize: 11, marginTop: 3 }, imageGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, boardImage: { width: 88, height: 88, borderRadius: 14, backgroundColor: "#EBC9C1" }, generatedVisual: { width: "100%", height: 220, borderRadius: 18, marginTop: 12 }, visualProvenance: { color: "#9C8D99", fontSize: 11, lineHeight: 16, marginTop: 8 }, visualActions: { flexDirection: "row", gap: 8, marginTop: 10 }, visualAction: { backgroundColor: "#2B1D2F", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 }, visualActionText: { color: "#FFF7F2", fontSize: 11, fontWeight: "700" }, visualRemove: { backgroundColor: "#F3E5E1" }, visualRemoveText: { color: "#7E4E54", fontSize: 11, fontWeight: "700" }, previewRow: { flexDirection: "row", gap: 8, marginTop: 12 }, previewCard: { flex: 1, backgroundColor: "#F5D7CF", borderRadius: 13, padding: 11 }, previewMode: { color: "#A06A70", fontSize: 10, fontWeight: "800", letterSpacing: 1 }, previewTitle: { color: "#2B1D2F", fontSize: 13, fontWeight: "700", marginTop: 6 }, previewLine: { color: "#7E4E54", fontSize: 11, lineHeight: 16, marginTop: 5 }, synthesisHistory: { marginTop: 8 }, synthesisHistoryItem: { backgroundColor: "#FFF7F2", borderRadius: 13, padding: 11, marginTop: 7 }, synthesisHistoryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, synthesisDeleteGlyph: { color: "#7E4E54", fontSize: 20, lineHeight: 20, marginLeft: 10 }, favoriteGlyph: { color: "#E96F61", fontSize: 18 }, filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 }, filter: { backgroundColor: "#F3E5E1", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 7 }, filterSelected: { backgroundColor: "#2B1D2F" }, filterText: { color: "#7E4E54", fontSize: 11, fontWeight: "700" }, filterTextSelected: { color: "#FFF7F2" }, favoriteFilter: { alignSelf: "flex-start", marginTop: 8, paddingVertical: 4 }, favoriteFilterText: { color: "#A06A70", fontSize: 11, fontWeight: "700" }, favoriteSelectedAction: { backgroundColor: "#F6C7B7" }, synthesisHistoryMeta: { color: "#A06A70", fontSize: 10, fontWeight: "800" }, synthesisHistoryText: { color: "#2B1D2F", fontSize: 12, lineHeight: 17, marginTop: 4 }, history: { marginTop: 10 }, historyItem: { backgroundColor: "#FFF7F2", borderRadius: 14, padding: 12, marginTop: 8 }, compareCheck: { alignSelf: "flex-start", backgroundColor: "#F3E5E1", borderRadius: 9, paddingHorizontal: 9, paddingVertical: 5, marginBottom: 8 }, compareCheckSelected: { backgroundColor: "#2B1D2F" }, compareCheckText: { color: "#7E4E54", fontSize: 11, fontWeight: "700" }, compareButton: { backgroundColor: "#2B1D2F", borderRadius: 13, padding: 12, marginTop: 12 }, compareButtonText: { color: "#FFF7F2", fontSize: 13, fontWeight: "700", textAlign: "center" }, synthesis: { backgroundColor: "#D8E1D5", borderRadius: 15, padding: 14, marginTop: 12 }, synthesisText: { color: "#2B1D2F", fontSize: 14, lineHeight: 20, marginTop: 7 }, historyActions: { flexDirection: "row", gap: 8, marginTop: 10 }, renameRow: { flexDirection: "row", gap: 8, marginTop: 10 }, renameInput: { flex: 1, minHeight: 36, backgroundColor: "#FFFFFF", borderRadius: 10, paddingHorizontal: 10, color: "#2B1D2F", fontSize: 13 }, smallAction: { backgroundColor: "#F5D7CF", borderRadius: 10, paddingHorizontal: 11, paddingVertical: 8 }, smallActionText: { color: "#2B1D2F", fontSize: 12, fontWeight: "700" }, deleteAction: { backgroundColor: "#F3E5E1" }, deleteText: { color: "#A34C4C", fontSize: 12, fontWeight: "700" }, historyTitle: { color: "#2B1D2F", fontSize: 14, fontWeight: "700" }, historyMeta: { color: "#7E4E54", fontSize: 11, marginTop: 3 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] } });
