import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Platform, Pressable, Share, StyleSheet, Text, TextInput, View } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { ScreenContainer } from "@/components/screen-container";
import { reportNonFatalError } from "@/lib/non-fatal-error";
import { RecoveryCard } from "@/components/ui/recovery-card";
import { Snackbar } from "@/components/ui/snackbar";
import { clearAiPromptHistory, clearFavoriteAiPromptHistory, deleteAiPromptHistoryItem, loadAiPromptHistory, repairAiPromptHistory, restoreAiPromptHistory, toggleAiPromptFavorite, type AiPromptHistoryItem } from "@/lib/ux/localStorage";
import { prepareAiHistoryExportText } from "@/lib/ux/export";

type HistoryItem = AiPromptHistoryItem & { preview?: boolean };
const MOCK_AI_HISTORY: HistoryItem = { prompt: "What small ritual could help me feel more like myself this week?", mode: "reflect", feedback: "useful", at: "2026-01-01T09:00:00.000Z", preview: true };

export default function AiHistoryScreen() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyUnavailable, setHistoryUnavailable] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [deletedItem, setDeletedItem] = useState<AiPromptHistoryItem | null>(null);
  const [clearedHistory, setClearedHistory] = useState<AiPromptHistoryItem[] | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState("");
  const [modeFilter, setModeFilter] = useState<"all" | "spark" | "reflect" | "play">("all");
  const [clearedFavorites, setClearedFavorites] = useState<AiPromptHistoryItem[] | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const params = useLocalSearchParams<{ filter?: string; mode?: string }>();
  const repair = useCallback(() => Alert.alert("Repair AI history?", "RARELY will keep readable saved AI metadata and clear only malformed records from this device. Your journal and images will remain unchanged.", [
    { text: "Keep as is", style: "cancel" },
    { text: "Repair history", style: "destructive", onPress: () => {
      if (repairing) return;
      setRepairing(true);
      void repairAiPromptHistory().then((repaired) => {
        setHistory(repaired.length ? repaired : [MOCK_AI_HISTORY]);
        setHistoryUnavailable(!repaired.length);
        setSnackbar(repaired.length ? `AI history repaired; ${repaired.length} readable prompt${repaired.length === 1 ? "" : "s"} preserved` : "AI history repaired; a private starter is shown");
      }).catch((error) => {
        reportNonFatalError("ai-history:repair", error);
        setSnackbar("Could not repair AI history. Nothing was cleared.");
      }).finally(() => setRepairing(false));
    } },
  ]), [repairing]);
  const load = useCallback(async () => {
    try {
      const loaded = await loadAiPromptHistory();
      const valid = loaded.filter((item): item is AiPromptHistoryItem => Boolean(item) && typeof item.prompt === "string" && item.prompt.trim().length > 0 && (item.mode === "spark" || item.mode === "reflect" || item.mode === "play") && (item.feedback === "useful" || item.feedback === "tryAnother" || item.feedback === "refined") && typeof item.at === "string" && !Number.isNaN(Date.parse(item.at)));
      if (valid.length !== loaded.length) {
        reportNonFatalError("ai-history:malformed-records", new Error("one or more saved AI history records were invalid"), { loaded: loaded.length, valid: valid.length });
        setHistory(valid.length ? valid.sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite))) : [MOCK_AI_HISTORY]);
        setHistoryUnavailable(true);
        setSnackbar("Some saved AI history was unreadable. Valid records remain available with a private starter preview.");
        return;
      }
      setHistory(valid.sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite))));
      setHistoryUnavailable(false);
    } catch (error) {
      reportNonFatalError("ai-history:load", error);
      setHistory([MOCK_AI_HISTORY]);
      setHistoryUnavailable(true);
      setSnackbar("Private AI history was unavailable. A starter prompt is shown instead.");
    }
  }, []);
  useEffect(() => { setFavoritesOnly(params.filter === "favorites"); if (params.mode === "spark" || params.mode === "reflect" || params.mode === "play") setModeFilter(params.mode); }, [params.filter, params.mode]);
  const undoDelete = useCallback(async () => { if (!deletedItem) return; try { const restored = [...history, deletedItem].sort((a, b) => Number(Boolean(b.favorite)) - Number(Boolean(a.favorite))); await import("@/lib/ux/localStorage").then(({ appendAiPromptHistory }) => appendAiPromptHistory(deletedItem)); setHistory(restored); setDeletedItem(null); setSnackbar("Prompt restored"); } catch { setSnackbar("Could not restore prompt"); } }, [deletedItem, history]);
  useEffect(() => { void load(); }, [load]);
  const favoriteCount = history.filter((item) => item.favorite).length;
  const readableHistory = history.filter((item) => !item.preview);
  const backupModes = Array.from(new Set(readableHistory.map((item) => item.mode).filter(Boolean))).join(", ") || "none";
  const exportAiHistory = useCallback(async () => {
    if (exporting) return;
    const text = prepareAiHistoryExportText(readableHistory);
    if (!text) { setSnackbar("There are no readable AI prompts to export."); return; }
    Alert.alert("Export AI prompts?", "This includes saved AI prompt metadata and prompt text. Journal text and images are not included, but the export may leave this device.", [
      { text: "Keep private", style: "cancel" },
      { text: "Export", onPress: () => {
        setExporting(true);
        void (async () => {
          try {
            if (Platform.OS === "web") {
              await Share.share({ message: text, title: "RARELY AI prompts" });
            } else {
              const sharingAvailable = await Sharing.isAvailableAsync();
              if (!sharingAvailable || !FileSystem.documentDirectory) throw new Error("AI history sharing is unavailable");
              const fileUri = `${FileSystem.documentDirectory}rarely-ai-prompts.txt`;
              await FileSystem.writeAsStringAsync(fileUri, text, { encoding: FileSystem.EncodingType.UTF8 });
              await Sharing.shareAsync(fileUri, { dialogTitle: "Share your RARELY AI prompts", mimeType: "text/plain" });
            }
            setSnackbar("Readable AI prompt metadata is ready to share");
          } catch (error) {
            reportNonFatalError("ai-history:export", error);
            setSnackbar("Could not export AI prompts. Your local history was not changed.");
          } finally { setExporting(false); }
        })();
      } },
    ]);
  }, [exporting, readableHistory]);
  const visibleHistory = history.filter((item) => (!favoritesOnly || item.favorite) && (modeFilter === "all" || item.mode === modeFilter) && (!query.trim() || item.prompt.toLowerCase().includes(query.trim().toLowerCase())));
  const undoClear = async () => { if (!clearedHistory) return; try { await restoreAiPromptHistory(clearedHistory); setHistory(clearedHistory); setClearedHistory(null); setSnackbar("AI prompt history restored"); } catch { setSnackbar("Could not restore AI history"); } };
  const clear = () => Alert.alert("Clear AI prompt history?", "This removes only saved AI prompt metadata. Your journal and images stay on this device.", [
    { text: "Keep history", style: "cancel" },
    { text: "Clear", style: "destructive", onPress: async () => { setClearedHistory(history); try { await clearAiPromptHistory(); setHistory([]); setSnackbar("AI prompt history cleared"); } catch { setClearedHistory(null); setSnackbar("Could not clear AI history"); } } },
  ]);
  return <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
    <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerLabel}>RARE AI</Text><View style={styles.spacer} /></View>
    <Text style={styles.title}>Your AI prompts.</Text><Text style={styles.subtitle}>A private, on-device record of prompt directions and feedback. Journal text and images are never stored here.</Text><TextInput accessibilityLabel="Search saved AI prompts on this device" value={query} onChangeText={setQuery} placeholder="Search saved prompts" placeholderTextColor="#9C8D99" style={styles.search} /><View style={styles.filters}><Pressable accessibilityRole="button" accessibilityState={{ selected: !favoritesOnly }} accessibilityLabel="Show all private AI prompts" onPress={() => setFavoritesOnly(false)} style={[styles.filter, !favoritesOnly && styles.filterSelected]}><Text style={styles.filterText}>All</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{ selected: favoritesOnly }} accessibilityLabel="Show favorite private AI prompts" onPress={() => setFavoritesOnly(true)} style={[styles.filter, favoritesOnly && styles.filterSelected]}><Text style={styles.filterText}>Favorites</Text></Pressable></View><View style={styles.filters}>{(["all", "spark", "reflect", "play"] as const).map((mode) => <Pressable key={mode} accessibilityRole="button" accessibilityState={{ selected: modeFilter === mode }} accessibilityLabel={`Show ${mode === "all" ? "all" : mode} AI prompts`} onPress={() => setModeFilter(mode)} style={[styles.filter, modeFilter === mode && styles.filterSelected]}><Text style={styles.filterText}>{mode === "all" ? "All modes" : mode[0].toUpperCase() + mode.slice(1)}</Text></Pressable>)}</View><Pressable accessibilityRole="button" accessibilityLabel={exporting ? "Exporting readable AI prompt metadata" : "Export readable AI prompt metadata"} accessibilityState={{ busy: exporting }} onPress={() => void exportAiHistory()} style={({ pressed }) => [styles.exportButton, exporting && styles.disabled, pressed && styles.pressed]}><Text style={styles.clearText}>{exporting ? "Preparing export…" : "Export readable AI metadata"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Clear favorite AI prompts" onPress={() => Alert.alert("Clear favorite prompts?", "Non-favorite AI prompts will stay on this device.", [{ text: "Keep favorites", style: "cancel" }, { text: "Clear favorites", style: "destructive", onPress: async () => { setClearedFavorites(history.filter((item) => item.favorite)); try { await clearFavoriteAiPromptHistory(); await load(); setSnackbar("Favorite prompts cleared"); } catch { setClearedFavorites(null); setSnackbar("Could not clear favorites"); } } }])} style={({ pressed }) => [styles.clearFavorites, pressed && styles.pressed]}><Text style={styles.clearText}>Clear favorites ({favoriteCount})</Text></Pressable>
    {historyUnavailable ? <RecoveryCard title="Private preview mode" message={`Saved prompt history could not be fully restored. Backup preview: ${readableHistory.length} readable record${readableHistory.length === 1 ? "" : "s"} in ${backupModes} mode${backupModes === "none" || backupModes.includes(",") ? "s" : ""} will be preserved; this example is not saved.`} retryLabel="Retry history" onRetry={() => void load()} secondaryLabel={repairing ? "Repairing…" : "Repair saved history"} onSecondary={repair} secondaryDestructive /> : null}
    {history.length && !historyUnavailable ? <Pressable accessibilityRole="button" accessibilityLabel="Clear private AI prompt history" onPress={clear} style={({ pressed }) => [styles.clear, pressed && styles.pressed]}><Text style={styles.clearText}>Clear AI history</Text></Pressable> : null}
    <FlatList data={visibleHistory} keyExtractor={(item) => `${item.at}:${item.prompt}`} contentContainerStyle={visibleHistory.length ? styles.list : styles.emptyList} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>✦</Text><Text style={styles.emptyTitle}>{favoritesOnly ? "No favorite prompts yet." : "No saved prompts yet."}</Text><Text style={styles.emptyBody}>When you mark a prompt useful or ask for another, its direction can appear here without your private writing.</Text><Pressable accessibilityRole="button" accessibilityLabel="Create a Rare AI prompt" onPress={() => router.replace("/(tabs)/create")} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Create with Rare AI</Text></Pressable></View>} renderItem={({ item }) => <View style={styles.card}>{item.preview ? <Text style={styles.previewLabel}>PRIVATE STARTER PREVIEW · NOT SAVED</Text> : null}<Text style={styles.prompt}>{item.prompt}</Text><Text style={styles.meta}>{item.preview ? "Private starter · not saved · " : "Saved locally · AI metadata only · "}{item.favorite ? "Favorite · " : ""}{item.feedback === "useful" ? "Marked useful" : item.feedback === "tryAnother" ? "Asked for another" : "Prompt refined"} · {new Date(item.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Text><View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel={item.favorite ? "Remove this prompt from favorites" : "Favorite this private AI prompt"} onPress={() => { if (!item.preview) void toggleAiPromptFavorite(item.at, item.prompt).then(setHistory); }} style={({ pressed }) => [styles.favorite, item.favorite && styles.favoriteSelected, item.preview && styles.disabled, pressed && styles.pressed]}><Text style={styles.favoriteText}>{item.favorite ? "Favorited ✓" : "Favorite"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Replay this private AI prompt" onPress={() => router.push({ pathname: "/journal", params: { promptOverride: item.prompt } })} style={({ pressed }) => [styles.replay, pressed && styles.pressed]}><Text style={styles.replayText}>Replay</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Delete this private AI prompt" onPress={() => { if (!item.preview) { setDeletedItem(item); void deleteAiPromptHistoryItem(item.at, item.prompt).then(load).then(() => setSnackbar("Prompt removed")); } }} style={({ pressed }) => [styles.delete, item.preview && styles.disabled, pressed && styles.pressed]}><Text style={styles.deleteText}>Delete</Text></Pressable></View></View>} />
    <Snackbar message={snackbar} actionLabel={clearedHistory || clearedFavorites ? "Undo" : deletedItem ? "Undo" : undefined} onAction={clearedHistory ? undoClear : clearedFavorites ? async () => { try { await restoreAiPromptHistory([...history, ...clearedFavorites]); await load(); setClearedFavorites(null); setSnackbar("Favorite prompts restored"); } catch { setSnackbar("Could not restore favorites"); } } : deletedItem ? undoDelete : undefined} onDismiss={() => setSnackbar(null)} />
  </ScreenContainer>;
}
const styles = StyleSheet.create({ header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 }, headerLabel: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 2 }, spacer: { width: 42 }, title: { color: "#2B1D2F", fontSize: 32, lineHeight: 37, fontWeight: "700" }, subtitle: { color: "#7E6F7D", fontSize: 14, lineHeight: 20, marginTop: 10 },   search: { backgroundColor: "#FFF7F2", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 15, paddingHorizontal: 13, paddingVertical: 10, marginTop: 14, color: "#2B1D2F", fontSize: 13 }, exportButton: { alignSelf: "flex-start", borderColor: "#E96F61", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 }, clearFavorites: { alignSelf: "flex-start", borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginTop: 10 }, clear: { alignSelf: "flex-start", borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, marginTop: 16 },   filters: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 }, filter: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 }, filterSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" }, filterText: { color: "#5F4A5E", fontSize: 12, fontWeight: "700" }, clearText: { color: "#5F4A5E", fontSize: 12, fontWeight: "700" }, list: { gap: 10, paddingVertical: 18 }, card: { backgroundColor: "#FFF7F2", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 18, padding: 15 }, prompt: { color: "#2B1D2F", fontSize: 15, lineHeight: 21, fontWeight: "700" }, meta: { color: "#9C8D99", fontSize: 11, marginTop: 7 }, actions: { flexDirection: "row", gap: 8, marginTop: 12 },   favorite: { borderColor: "#E96F61", borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 }, favoriteSelected: { backgroundColor: "#F6C7B7" }, favoriteText: { color: "#7E4F4A", fontSize: 11, fontWeight: "700" }, replay: { backgroundColor: "#2B1D2F", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 }, replayText: { color: "#FFF7F2", fontSize: 11, fontWeight: "700" }, delete: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 999, paddingHorizontal: 13, paddingVertical: 8 }, deleteText: { color: "#7E6F7D", fontSize: 11, fontWeight: "700" }, emptyList: { flexGrow: 1, justifyContent: "center" }, empty: { alignItems: "center", paddingBottom: 80 }, emptyIcon: { color: "#E96F61", fontSize: 32 }, emptyTitle: { color: "#2B1D2F", fontSize: 20, fontWeight: "700", marginTop: 10 }, emptyBody: { color: "#7E6F7D", fontSize: 14, lineHeight: 20, textAlign: "center", marginTop: 8 }, primary: { backgroundColor: "#2B1D2F", borderRadius: 18, paddingHorizontal: 20, paddingVertical: 14, marginTop: 18 }, primaryText: { color: "#FFF7F2", fontSize: 14, fontWeight: "700" }, previewLabel: { color: "#A06A70", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 7 }, disabled: { opacity: 0.45 }, pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] } });
