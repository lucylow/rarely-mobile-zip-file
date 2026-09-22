import { useCallback, useMemo, useRef, useState } from "react";
import { Alert, FlatList, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Switch, Text, View, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { Snackbar } from "@/components/ui/snackbar";
import { PrivacyStatus } from "@/components/ui/privacy-status";
import { runGuarded } from "@/lib/ux/guards";
import { parseActivityRecords } from "@/lib/ux/localStorage";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { safeJsonParse } from "@/lib/utils";

const scrapbookVisuals: Record<Activity["kind"], string> = {
  journal: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png",
  moment: "/manus-storage/rarely-scrapbook-color_bbc09103.png",
  circle: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png",
  routine: "/manus-storage/rarely-card-movement_ff8eddc9.png",
};

const visualSequences: Record<Activity["kind"], { uri: string; label: string }[]> = {
  journal: [
    { uri: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png", label: "Reflection texture" },
    { uri: "/manus-storage/rarely-profile-archive_1f2c02c6.png", label: "Personal archive texture" },
    { uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png", label: "Color texture" },
  ],
  moment: [
    { uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png", label: "Color texture" },
    { uri: "/manus-storage/rarely-profile-reflection_7bbb06d5.png", label: "Reflective texture" },
    { uri: "/manus-storage/rarely-card-movement_ff8eddc9.png", label: "Movement texture" },
  ],
  circle: [
    { uri: "/manus-storage/rarely-community-circle_4172fac0.png", label: "Community circle texture" },
    { uri: "/manus-storage/rarely-community-listening_7a89c428.png", label: "Listening circle texture" },
    { uri: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png", label: "Shared reflection texture" },
  ],
  routine: [
    { uri: "/manus-storage/rarely-studio-making_74b6fbec.png", label: "Creative making texture" },
    { uri: "/manus-storage/rarely-studio-focus_85abd483.png", label: "Focused ritual texture" },
    { uri: "/manus-storage/rarely-card-movement_ff8eddc9.png", label: "Movement texture" },
  ],
};

type Activity = { id: string; kind: "journal" | "moment" | "circle" | "routine"; label: string; title: string; body: string; date?: string; color: string; entryIndex?: number; sourceId?: string; note?: string; imageUri?: string };

type JournalEntry = { text: string; date: string; imageUri?: string };

const notePreview = (note?: string) => note ? `Private note: “${note.trim().slice(0, 72)}${note.trim().length > 72 ? "…" : ""}”` : undefined;
const activityFallback = (kind: Activity["kind"]) => kind === "moment" ? "A saved Rare Moment kept locally." : kind === "circle" ? "A Community circle joined locally." : "A Studio ritual completed locally.";

export default function ScrapbookScreen() {
  const { width } = useWindowDimensions();
  const viewerWidth = Math.max(240, Math.min(360, width - 72));
  const [activities, setActivities] = useState<Activity[]>([]);
  const [filter, setFilter] = useState<"all" | Activity["kind"]>("all");
  const [deletedEntry, setDeletedEntry] = useState<{ activity: Activity; entry: JournalEntry; index: number } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [showActivityNotePreviews, setShowActivityNotePreviews] = useState(true);
  const [selectedVisual, setSelectedVisual] = useState<Activity | null>(null);
  const [visualIndex, setVisualIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [mutatingEntry, setMutatingEntry] = useState(false);
  const visualScrollRef = useRef<ScrollView>(null);

  const loadScrapbookData = useCallback(async (isActive: () => boolean) => {
    const loaded = await runGuarded(async () => Promise.all([
      AsyncStorage.getItem("rarely.journalEntries"),
      AsyncStorage.getItem("rarely.completedMoments"),
      AsyncStorage.getItem("rarely.joinedCircles"),
      AsyncStorage.getItem("rarely.completedRoutines"),
      AsyncStorage.getItem("rarely.showActivityNotePreviews"),
    ]), () => {
      if (isActive()) setSnackbar("Unable to refresh Scrapbook right now");
    });
    if (!loaded || !isActive()) return;
    const [journalValue, momentsValue, circlesValue, routinesValue, notePreviewValue] = loaded;

    const shouldShowNotePreviews = notePreviewValue !== "false";
    setShowActivityNotePreviews(shouldShowNotePreviews);
    const entries = safeJsonParse<JournalEntry[]>(journalValue, []);
    const moments = parseActivityRecords(momentsValue);
    const circles = parseActivityRecords(circlesValue);
    const routines = parseActivityRecords(routinesValue);
    const journalActivities = entries.map((entry, index) => ({
      id: `journal-${index}`,
      kind: "journal" as const,
      label: "JOURNAL",
      title: "A thought worth keeping",
      body: entry.text,
      date: entry.date,
      color: "#F5D7CF",
      entryIndex: index,
      imageUri: entry.imageUri,
    }));
    const summaries: Activity[] = [];
    const latestMoment = [...moments].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))[0];
    const latestCircle = [...circles].sort((a, b) => (b.joinedAt ?? "").localeCompare(a.joinedAt ?? ""))[0];
    const latestRoutine = [...routines].sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))[0];
    const preview = (note?: string) => (shouldShowNotePreviews ? notePreview(note) : undefined);
    if (moments.length)
      summaries.push({
        id: "moments",
        kind: "moment",
        label: "RARE MOMENT",
        title: latestMoment?.name ?? `${moments.length} moments completed`,
        body: preview(latestMoment?.note) ?? `${moments.length} Rare Moment${moments.length === 1 ? "" : "s"} saved.`,
        date: latestMoment?.completedAt,
        sourceId: latestMoment?.id,
        note: latestMoment?.note,
        color: "#D9CDE7",
      });
    if (circles.length)
      summaries.push({
        id: "circles",
        kind: "circle",
        label: "COMMUNITY",
        title: latestCircle?.name ?? `${circles.length} circles joined`,
        body: preview(latestCircle?.note) ?? `${circles.length} circle${circles.length === 1 ? "" : "s"} joined locally.`,
        date: latestCircle?.joinedAt,
        sourceId: latestCircle?.id,
        note: latestCircle?.note,
        color: "#F8E3A8",
      });
    if (routines.length)
      summaries.push({
        id: "routines",
        kind: "routine",
        label: "RARE STUDIO",
        title: latestRoutine?.name ?? `${routines.length} rituals completed`,
        body:
          preview(latestRoutine?.note) ??
          `${latestRoutine?.name ?? `${routines.length} ritual${routines.length === 1 ? "" : "s"}`} completed locally.`,
        date: latestRoutine?.completedAt,
        sourceId: latestRoutine?.id,
        note: latestRoutine?.note,
        color: "#F6C7B7",
      });
    setActivities([...journalActivities, ...summaries].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")));
  }, []);

  useAsyncFocusEffect(loadScrapbookData, [loadScrapbookData]);
  const filteredActivities = useMemo(() => filter === "all" ? activities : activities.filter((activity) => activity.kind === filter), [activities, filter]);
  const selectedSlides = selectedVisual ? (selectedVisual.imageUri ? [{ uri: selectedVisual.imageUri, label: "Your private journal image" }, ...visualSequences[selectedVisual.kind].slice(0, 2)] : visualSequences[selectedVisual.kind]) : [];
  const deleteJournal = (activity: Activity) => {
    if (activity.entryIndex === undefined) return;
    if (mutatingEntry) return;
    Alert.alert("Delete this reflection?", "This removes the entry from your local journal.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        setMutatingEntry(true);
        const removed = await runGuarded(async () => {
          const value = await AsyncStorage.getItem("rarely.journalEntries");
          const entries = safeJsonParse<JournalEntry[]>(value, []);
          const removed = entries[activity.entryIndex as number];
          if (!removed) {
            setSnackbar("Could not find that reflection");
            return null;
          }
          const next = entries.filter((_, index) => index !== activity.entryIndex);
          await AsyncStorage.setItem("rarely.journalEntries", JSON.stringify(next));
          return removed;
        }, () => {
          setSnackbar("Could not delete reflection");
          return null;
        });
        if (removed) {
          setActivities((current) => current.filter((item) => item.id !== activity.id));
          setDeletedEntry({ activity, entry: removed, index: activity.entryIndex as number });
          setSnackbar("Reflection deleted from this device");
        }
        setMutatingEntry(false);
      } },
    ]);
  };
  const undoDelete = useCallback(async () => {
    if (!deletedEntry || mutatingEntry) return;
    setMutatingEntry(true);
    const restored = await runGuarded(async () => {
      const value = await AsyncStorage.getItem("rarely.journalEntries");
      const entries = safeJsonParse<JournalEntry[]>(value, []);
      const nextEntries = [...entries.slice(0, deletedEntry.index), deletedEntry.entry, ...entries.slice(deletedEntry.index)];
      await AsyncStorage.setItem("rarely.journalEntries", JSON.stringify(nextEntries));
      return true;
    }, () => {
      setSnackbar("Could not restore reflection");
      return false;
    });
    if (restored) {
      setActivities((current) => [...current, deletedEntry.activity].sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")));
      setDeletedEntry(null);
      setSnackbar("Reflection restored");
    }
    setMutatingEntry(false);
  }, [deletedEntry, mutatingEntry]);

  const toggleNotePreviews = async (value: boolean) => {
    const previousSetting = showActivityNotePreviews;
    const previousActivities = activities;
    setShowActivityNotePreviews(value);
    setActivities((current) => current.map((item) => item.note ? { ...item, body: value ? (notePreview(item.note) ?? activityFallback(item.kind)) : activityFallback(item.kind) } : item));
    const saved = await runGuarded(
      () => AsyncStorage.setItem("rarely.showActivityNotePreviews", String(value)),
      undefined,
    );
    if (saved === undefined) {
      setShowActivityNotePreviews(previousSetting);
      setActivities(previousActivities);
      setSnackbar("Could not update note preview setting");
      return;
    }
    setSnackbar(value ? "Private note previews shown" : "Private note previews hidden");
  };

  const revealNote = (note?: string) => {
    if (!note) return;
    Alert.alert("Reveal private note?", "This note is stored locally and will be shown only in this confirmation flow.", [{ text: "Keep private", style: "cancel" }, { text: "Show note", onPress: () => Alert.alert("Private note", note, [{ text: "Done", style: "cancel" }]) }]);
  };

  const openActivity = (activity: Activity) => {
    if (activity.kind === "journal") router.push({ pathname: "/journal", params: { initial: activity.body, imageUri: activity.imageUri, ...(activity.entryIndex !== undefined ? { editIndex: String(activity.entryIndex) } : {}) } });
    else router.push({ pathname: "/activity", params: { kind: activity.kind, id: activity.sourceId, title: activity.title, body: activity.body, date: activity.date, note: activity.note } });
  };

  const refreshScrapbook = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadScrapbookData(() => true);
    } finally {
      setRefreshing(false);
    }
  }, [loadScrapbookData]);
  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable>
      <Text style={styles.kicker}>YOUR SCRAPBOOK</Text>
      <Text style={styles.title}>The story is still becoming.</Text>
      <Text style={styles.subtitle}>A chronological collection of the small things you chose to notice.</Text><View accessibilityLabel="Visual memory strip showing reflection, color, and movement" style={styles.memoryStrip}><Image source={{ uri: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png" }} resizeMode="cover" accessibilityLabel="Reflection texture" style={styles.memoryTile} /><Image source={{ uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png" }} resizeMode="cover" accessibilityLabel="Color texture" style={styles.memoryTile} /><Image source={{ uri: "/manus-storage/rarely-card-movement_ff8eddc9.png" }} resizeMode="cover" accessibilityLabel="Movement texture" style={styles.memoryTile} /></View>
      <PrivacyStatus visible={showActivityNotePreviews} />
      <View style={styles.privacyToggle}><View style={styles.privacyCopy}><Text style={styles.privacyTitle}>Private note previews</Text><Text style={styles.privacyBody}>{showActivityNotePreviews ? "Visible in this scrapbook" : "Hidden from this scrapbook"}</Text></View><Switch accessibilityLabel="Show private note previews in Scrapbook" value={showActivityNotePreviews} onValueChange={toggleNotePreviews} trackColor={{ false: "#EDE4E0", true: "#E96F61" }} /></View>
      <View accessibilityRole="radiogroup" style={styles.filters}>{(["all", "journal", "moment", "circle", "routine"] as const).map((option) => <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected: filter === option }} accessibilityLabel={`Show ${option === "all" ? "all activity" : option} entries`} onPress={() => setFilter(option)} style={({ pressed }) => [styles.filter, filter === option && styles.filterSelected, pressed && styles.pressed]}><Text style={[styles.filterText, filter === option && styles.filterTextSelected]}>{option === "all" ? "All" : option === "journal" ? "Journals" : option === "moment" ? "Moments" : option === "circle" ? "Circles" : "Rituals"}</Text></Pressable>)}</View>
      <FlatList data={filteredActivities} keyExtractor={(item) => item.id} contentContainerStyle={filteredActivities.length ? styles.list : styles.emptyList} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshScrapbook} tintColor="#2B1D2F" colors={["#2B1D2F"]} />} ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>✦</Text><Text style={styles.emptyTitle}>{activities.length && filter !== "all" ? "Nothing in this filter yet." : "Begin anywhere."}</Text><Text style={styles.emptyBody}>{activities.length && filter !== "all" ? "Try another filter to revisit more of your story." : "Save a journal thought, complete a Rare Moment, join a circle, or try a ritual. Your scrapbook will grow from there."}</Text>{activities.length && filter !== "all" ? <Pressable accessibilityRole="button" accessibilityLabel="Show all scrapbook activity" onPress={() => setFilter("all")} style={({ pressed }) => [styles.secondaryAction, pressed && styles.pressed]}><Text style={styles.secondaryActionText}>Show all entries</Text></Pressable> : <Pressable accessibilityRole="button" accessibilityLabel="Start a Rare Moment" onPress={() => router.replace({ pathname: "/moment", params: { mood: "creative" } })} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>Start a moment</Text></Pressable>}</View>} renderItem={({ item }) => <View style={[styles.card, { backgroundColor: item.color }]}><Pressable accessibilityRole="button" accessibilityLabel={`${item.title}. Open related activity`} onPress={() => openActivity(item)} style={({ pressed }) => [pressed && styles.pressed]}><Image source={{ uri: item.imageUri ?? scrapbookVisuals[item.kind] }} resizeMode="cover" accessibilityLabel={item.imageUri ? "Your private journal image" : `${item.label.toLowerCase()} scrapbook visual`} style={styles.cardVisual} /><View accessibilityLabel={`${item.label.toLowerCase()} visual layers`} style={styles.cardVisualLayers}>{(item.imageUri ? [{ uri: item.imageUri, label: "Your private journal image" }, ...visualSequences[item.kind].slice(0, 2)] : visualSequences[item.kind]).map((layer) => <Image key={layer.uri} source={{ uri: layer.uri }} resizeMode="cover" accessibilityLabel={layer.label} style={styles.cardVisualLayer} />)}</View><Text style={styles.label}>{item.label}</Text><Text style={styles.cardTitle}>{item.title}</Text><Text style={styles.cardBody}>{item.body}</Text>{item.date ? <Text style={styles.date}>{new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</Text> : null}{item.note && showActivityNotePreviews ? <Pressable accessibilityRole="button" accessibilityLabel="Reveal private note preview" hitSlop={8} onPress={() => revealNote(item.note)} style={({ pressed }) => [styles.noteLink, pressed && styles.pressed]}><Text style={styles.noteLinkText}>Read full private note</Text></Pressable> : null}<Text style={styles.openHint}>Open  →</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`View visual for ${item.title}`} hitSlop={8} onPress={() => { setSelectedVisual(item); setVisualIndex(0); }} style={({ pressed }) => [styles.visualButton, pressed && styles.pressed]}><Text style={styles.visualButtonText}>View visual</Text></Pressable>{item.kind === "journal" ? <View style={styles.actions}><Pressable accessibilityRole="button" accessibilityLabel="Edit this journal entry" hitSlop={8} onPress={() => router.push({ pathname: "/journal", params: { initial: item.body, imageUri: item.imageUri, editIndex: String(item.entryIndex) } })} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.actionText}>Edit</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Delete this journal entry" hitSlop={8} onPress={() => deleteJournal(item)} style={({ pressed }) => [styles.action, pressed && styles.pressed]}><Text style={styles.deleteText}>Delete</Text></Pressable></View> : null}</View>} />
      <Snackbar message={snackbar} actionLabel={deletedEntry ? "Undo" : undefined} onAction={deletedEntry ? undoDelete : undefined} onDismiss={() => setSnackbar(null)} />
      <Modal visible={Boolean(selectedVisual)} transparent animationType="fade" onRequestClose={() => setSelectedVisual(null)}>
        <View style={styles.viewerBackdrop}>
          <View style={styles.viewerCard} accessibilityViewIsModal accessibilityLabel={selectedVisual ? `${selectedVisual.label} visual sequence` : "Visual sequence"}>
            {selectedVisual ? <>
              <ScrollView ref={visualScrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(event) => setVisualIndex(Math.round(event.nativeEvent.contentOffset.x / viewerWidth))} style={[styles.viewerScroller, { width: viewerWidth }]}>
                {selectedSlides.map((slide) => <View key={slide.uri} style={[styles.viewerSlide, { width: viewerWidth }]}><Image source={{ uri: slide.uri }} resizeMode="cover" accessibilityLabel={slide.label} style={[styles.viewerImage, { width: viewerWidth }]} /></View>)}
              </ScrollView>
              <Text style={styles.viewerCount}>Visual {visualIndex + 1} of {selectedSlides.length}</Text>
              <Text style={styles.viewerKicker}>{selectedVisual.label}</Text>
              <Text style={styles.viewerTitle}>{selectedVisual.title}</Text>
              {selectedVisual.date ? <Text style={styles.viewerDate}>{new Date(selectedVisual.date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</Text> : null}
              <Text style={styles.viewerPrivacy}>This visual sequence is part of your private, on-device scrapbook.</Text>
              <View style={styles.viewerNav}><Pressable accessibilityRole="button" accessibilityLabel="Previous visual" accessibilityState={{ disabled: visualIndex === 0 }} disabled={visualIndex === 0} onPress={() => { const next = visualIndex - 1; setVisualIndex(next); visualScrollRef.current?.scrollTo({ x: next * viewerWidth, animated: true }); }} style={[styles.viewerNavButton, visualIndex === 0 && styles.viewerNavDisabled]}><Text style={styles.viewerNavText}>‹ Previous</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Next visual" accessibilityState={{ disabled: visualIndex === selectedSlides.length - 1 }} disabled={visualIndex === selectedSlides.length - 1} onPress={() => { const next = visualIndex + 1; setVisualIndex(next); visualScrollRef.current?.scrollTo({ x: next * viewerWidth, animated: true }); }} style={[styles.viewerNavButton, visualIndex === selectedSlides.length - 1 && styles.viewerNavDisabled]}><Text style={styles.viewerNavText}>Next ›</Text></Pressable></View>
              <Pressable accessibilityRole="button" accessibilityLabel="Close visual viewer" onPress={() => setSelectedVisual(null)} style={styles.viewerClose}><Text style={styles.viewerCloseText}>Close</Text></Pressable>
            </> : null}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ privacyToggle: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 16 }, privacyCopy: { flex: 1, paddingRight: 12 }, privacyTitle: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" }, privacyBody: { color: "#7E6F7D", fontSize: 11, marginTop: 3 }, filters: { flexDirection: "row", gap: 7, marginTop: 17, marginBottom: 2, flexWrap: "wrap" }, filter: { borderRadius: 15, borderWidth: 1, borderColor: "#EDE4E0", backgroundColor: "#FFFFFF", paddingHorizontal: 11, paddingVertical: 7 }, filterSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" }, filterText: { color: "#7E6F7D", fontSize: 11, fontWeight: "700" }, filterTextSelected: { color: "#FFF7F2" }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 }, kicker: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 2, marginTop: 20 }, title: { color: "#2B1D2F", fontSize: 30, lineHeight: 36, fontWeight: "700", marginTop: 9 }, subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 21, marginTop: 9 }, memoryStrip: { flexDirection: "row", gap: 8, marginTop: 16 }, memoryTile: { flex: 1, height: 72, borderRadius: 16 }, visualButton: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center", paddingVertical: 7, paddingHorizontal: 2 }, visualButtonText: { color: "#7E6F7D", fontSize: 12, fontWeight: "700" }, viewerBackdrop: { flex: 1, backgroundColor: "rgba(43,29,47,0.72)", alignItems: "center", justifyContent: "center", padding: 20 }, viewerCard: { width: "100%", maxWidth: 420, backgroundColor: "#FFF7F2", borderRadius: 25, padding: 16 }, viewerScroller: { width: 360 }, viewerSlide: { width: 360 }, viewerImage: { width: "100%", height: 260, borderRadius: 19 }, viewerCount: { color: "#9C8D99", fontSize: 11, textAlign: "center", marginTop: 9 }, viewerNav: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 16 }, viewerNavButton: { flex: 1, borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 14, paddingVertical: 11, alignItems: "center" }, viewerNavDisabled: { opacity: 0.35 }, viewerNavText: { color: "#5F4A5E", fontSize: 12, fontWeight: "700" }, viewerKicker: { color: "#E96F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginTop: 16 }, viewerTitle: { color: "#2B1D2F", fontSize: 22, lineHeight: 28, fontWeight: "700", marginTop: 7 }, viewerDate: { color: "#7E6F7D", fontSize: 12, marginTop: 7 }, viewerPrivacy: { color: "#7E6F7D", fontSize: 12, lineHeight: 18, marginTop: 12 }, viewerClose: { backgroundColor: "#2B1D2F", borderRadius: 16, paddingVertical: 14, alignItems: "center", marginTop: 18 }, viewerCloseText: { color: "#FFF7F2", fontSize: 14, fontWeight: "700" }, list: { paddingTop: 22, paddingBottom: 28, gap: 12 }, emptyList: { flexGrow: 1, justifyContent: "center" }, empty: { alignItems: "center", paddingHorizontal: 20 }, emptyIcon: { color: "#E96F61", fontSize: 34 }, emptyTitle: { color: "#2B1D2F", fontSize: 22, fontWeight: "700", marginTop: 14 }, emptyBody: { color: "#7E6F7D", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 7 }, card: { borderRadius: 22, padding: 17 }, cardVisual: { width: "100%", height: 92, borderRadius: 16, marginBottom: 8 }, cardVisualLayers: { flexDirection: "row", gap: 6, marginBottom: 8 }, cardVisualLayer: { flex: 1, height: 34, borderRadius: 8 }, label: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 }, cardTitle: { color: "#2B1D2F", fontSize: 19, fontWeight: "700", marginTop: 13 }, cardBody: { color: "#5F4A5E", fontSize: 14, lineHeight: 20, marginTop: 5 }, date: { color: "#7E6F7D", fontSize: 11, fontWeight: "700", marginTop: 14 }, actions: { flexDirection: "row", gap: 16, marginTop: 15 }, action: { minHeight: 36, justifyContent: "center", paddingVertical: 6 }, actionText: { color: "#2B1D2F", fontSize: 12, fontWeight: "700" }, deleteText: { color: "#B96861", fontSize: 12, fontWeight: "700" }, noteLink: { minHeight: 36, justifyContent: "center", paddingVertical: 5, marginTop: 8 }, noteLinkText: { color: "#B96861", fontSize: 12, fontWeight: "700" }, openHint: { color: "#2B1D2F", fontSize: 12, fontWeight: "700", marginTop: 13 }, primary: { backgroundColor: "#2B1D2F", borderRadius: 17, paddingVertical: 14, paddingHorizontal: 18, marginTop: 20 }, primaryText: { color: "#FFF7F2", fontSize: 14, fontWeight: "700" }, secondaryAction: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 17, paddingVertical: 12, paddingHorizontal: 16, marginTop: 20 }, secondaryActionText: { color: "#5F4A5E", fontSize: 13, fontWeight: "700" }, pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] }, });
