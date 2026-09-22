import { useCallback, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { Snackbar } from "@/components/ui/snackbar";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { triggerLightImpact } from "@/lib/ux/haptics";
import { reportNonFatalError } from "@/lib/non-fatal-error";
import { RecoveryCard } from "@/components/ui/recovery-card";

type Entry = { text: string; date: string; preview?: boolean };
const MOCK_ENTRY: Entry = { text: "A private starter reflection: notice one small thing that helped you feel present today.", date: "2026-01-01T09:00:00.000Z", preview: true };

export default function JournalLibraryScreen() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [entriesUnavailable, setEntriesUnavailable] = useState(false);
  const [deletedEntry, setDeletedEntry] = useState<{ entry: Entry; index: number } | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [updatingEntries, setUpdatingEntries] = useState(false);
  const [repairingEntries, setRepairingEntries] = useState(false);
  const loadEntries = useCallback(async (isActive: () => boolean) => {
    try {
      const stored = await AsyncStorage.getItem("rarely.journalEntries");
      if (!isActive()) return;
      if (!stored) { setEntries([]); setEntriesUnavailable(false); return; }
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed)) throw new Error("journal payload was not a list");
      const valid = parsed.filter((item): item is Entry => Boolean(item) && typeof item === "object" && typeof (item as Entry).text === "string" && typeof (item as Entry).date === "string");
      setEntries(valid);
      setEntriesUnavailable(false);
    } catch (error) {
      if (!isActive()) return;
      reportNonFatalError("journal-library:load", error);
      setEntries([MOCK_ENTRY]);
      setEntriesUnavailable(true);
      setSnackbar("Saved journal entries were unavailable. A private starter reflection is shown.");
    }
  }, []);
  useAsyncFocusEffect(loadEntries, [loadEntries]);

  const confirmRepair = () => Alert.alert("Clear malformed journal data?", "This removes only the unreadable journal storage value. Other local data remains unchanged. If you want to keep a copy, use Storage Health to create a local backup first.", [
    { text: "Cancel", style: "cancel" },
    { text: "Clear journal data", style: "destructive", onPress: () => {
      setRepairingEntries(true);
      void AsyncStorage.removeItem("rarely.journalEntries").then(() => {
        setEntries([]);
        setEntriesUnavailable(false);
        setSnackbar("Malformed journal data was cleared");
      }).catch((error) => {
        reportNonFatalError("journal-library:repair", error);
        setSnackbar("Could not clear malformed journal data");
      }).finally(() => setRepairingEntries(false));
    } },
  ]);

  const removeEntry = (index: number) => {
    if (updatingEntries || entriesUnavailable) return;
    if (entries[index]?.preview) return;
    Alert.alert("Delete this reflection?", "This removes the entry from your local journal.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        const removed = entries[index];
        if (!removed) return;
        const next = entries.filter((_, itemIndex) => itemIndex !== index);
        setUpdatingEntries(true);
        setEntries(next);
        try {
          await AsyncStorage.setItem("rarely.journalEntries", JSON.stringify(next));
          await triggerLightImpact();
          setDeletedEntry({ entry: removed, index });
          setSnackbar("Reflection deleted from this device");
        } catch {
          setEntries(entries);
          setSnackbar("Could not delete this reflection right now");
        } finally {
          setUpdatingEntries(false);
        }
      } },
    ]);
  };

  const undoDelete = useCallback(async () => {
    if (!deletedEntry || updatingEntries) return;
    const restored = [...entries.slice(0, deletedEntry.index), deletedEntry.entry, ...entries.slice(deletedEntry.index)];
    setUpdatingEntries(true);
    setEntries(restored);
    try {
      await AsyncStorage.setItem("rarely.journalEntries", JSON.stringify(restored));
      setDeletedEntry(null);
      setSnackbar("Reflection restored");
    } catch {
      setEntries(entries);
      setSnackbar("Could not restore this reflection");
    } finally {
      setUpdatingEntries(false);
    }
  }, [deletedEntry, entries, updatingEntries]);

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerLabel}>SAVED JOURNAL</Text><View style={styles.spacer} /></View>
      <Text style={styles.title}>Words worth keeping.</Text>
      <Text style={styles.subtitle}>A quiet archive of the moments you chose to notice.</Text>
      {entriesUnavailable ? <RecoveryCard title="Private preview mode" message="Saved journal entries could not be restored. This example is not saved, and your existing writing was not opened or changed." retryLabel="Retry journal" onRetry={() => void loadEntries(() => true)} secondaryLabel={repairingEntries ? "Clearing journal…" : "Clear malformed journal"} onSecondary={repairingEntries ? undefined : confirmRepair} secondaryDestructive /> : null}
      <FlatList data={entries} keyExtractor={(_, index) => `${index}`} contentContainerStyle={entries.length ? styles.list : styles.emptyList} showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyIcon}>✍︎</Text><Text style={styles.emptyTitle}>Nothing saved yet.</Text><Text style={styles.emptyBody}>When a thought feels worth keeping, it will find its way here.</Text><Pressable accessibilityRole="button" accessibilityLabel="Write your first journal entry" onPress={() => router.replace("/journal")} style={styles.primary}><Text style={styles.primaryText}>Write your first entry</Text></Pressable></View>}
        renderItem={({ item, index }) => <View style={styles.entry}>{item.preview ? <Text style={styles.previewLabel}>PRIVATE STARTER PREVIEW · NOT SAVED</Text> : null}<Text style={styles.date}>{new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</Text><Text style={styles.entryText}>{item.text}</Text><View style={styles.actions}><Pressable accessibilityRole="button" accessibilityState={{ disabled: updatingEntries || Boolean(item.preview) }} disabled={updatingEntries || Boolean(item.preview)} accessibilityLabel={`Edit journal entry ${index + 1}`} hitSlop={10} onPress={() => router.push({ pathname: "/journal", params: { initial: item.text, editIndex: String(index) } })} style={styles.actionButton}><Text style={styles.edit}>Edit</Text></Pressable><Pressable accessibilityRole="button" accessibilityState={{ disabled: updatingEntries || Boolean(item.preview) }} disabled={updatingEntries || Boolean(item.preview)} accessibilityLabel={`Delete journal entry ${index + 1}`} hitSlop={10} onPress={() => removeEntry(index)} style={styles.actionButton}><Text style={styles.delete}>{updatingEntries ? "Saving..." : "Delete"}</Text></Pressable></View></View>}
      />
      <Snackbar message={snackbar} actionLabel={deletedEntry && !updatingEntries ? "Undo" : undefined} onAction={deletedEntry && !updatingEntries ? undoDelete : undefined} onDismiss={() => setSnackbar(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 }, headerLabel: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 2 }, spacer: { width: 42 }, title: { color: "#2B1D2F", fontSize: 31, lineHeight: 37, fontWeight: "700", marginTop: 3 }, subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 21, marginTop: 9 }, list: { paddingTop: 24, paddingBottom: 30, gap: 12 }, emptyList: { flexGrow: 1, justifyContent: "center" }, entry: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 21, padding: 17 }, date: { color: "#E96F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.3, textTransform: "uppercase" }, entryText: { color: "#2B1D2F", fontSize: 16, lineHeight: 23, marginTop: 10 }, actions: { flexDirection: "row", gap: 16, marginTop: 16 }, actionButton: { minHeight: 36, justifyContent: "center", paddingVertical: 6, paddingHorizontal: 2 }, edit: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" }, delete: { color: "#B96861", fontSize: 13, fontWeight: "700" }, empty: { alignItems: "center", paddingHorizontal: 25 }, emptyIcon: { color: "#E96F61", fontSize: 34 }, emptyTitle: { color: "#2B1D2F", fontSize: 21, fontWeight: "700", marginTop: 15 }, emptyBody: { color: "#7E6F7D", fontSize: 14, lineHeight: 21, textAlign: "center", marginTop: 7 }, primary: { backgroundColor: "#2B1D2F", borderRadius: 17, paddingVertical: 14, paddingHorizontal: 18, marginTop: 20 }, primaryText: { color: "#FFF7F2", fontSize: 14, fontWeight: "700" }, previewLabel: { color: "#A06A70", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, marginBottom: 7 }, pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] }, });
