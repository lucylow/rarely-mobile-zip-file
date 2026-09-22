import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { FadeInView } from "@/components/ui/fade-in-view";
import { reportNonFatalError } from "@/lib/non-fatal-error";
import { LOCAL_ACTIVITY_KEYS } from "@/lib/ux/localActivity";

const healthKeys = [
  { key: LOCAL_ACTIVITY_KEYS.journal, label: "Journal entries", private: true },
  { key: "rarely.journalDraft", label: "Journal draft", private: true },
  { key: LOCAL_ACTIVITY_KEYS.moments, label: "Rare moments", private: false },
  { key: LOCAL_ACTIVITY_KEYS.circles, label: "Joined circles", private: false },
  { key: LOCAL_ACTIVITY_KEYS.routines, label: "Completed rituals", private: false },
  { key: "rarely.creativeLab.history", label: "Creative boards", private: true },
  { key: "rarely.creativeLab.syntheses", label: "AI syntheses", private: true },
  { key: "rarely.preferences", label: "Preferences", private: true },
] as const;

type HealthStatus = "available" | "empty" | "malformed" | "unavailable";
type HealthRow = (typeof healthKeys)[number] & { status: HealthStatus; count: number };

function classifyStoredValue(raw: string | null, key: string): { status: Exclude<HealthStatus, "unavailable">; count: number } {
  if (!raw) return { status: "empty", count: 0 };
  if (key === "rarely.journalDraft" || key === "rarely.preferences") return { status: "available", count: 1 };
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return { status: "available", count: 1 };
    return { status: value.length ? "available" : "empty", count: value.length };
  } catch {
    return { status: "malformed", count: 0 };
  }
}


export default function StorageHealthScreen() {
  const [rows, setRows] = useState<HealthRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairTarget, setRepairTarget] = useState<HealthRow | null>(null);
  const [backupCopied, setBackupCopied] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadHealth = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    const results = await Promise.all(healthKeys.map(async (item) => {
      try {
        const raw = await AsyncStorage.getItem(item.key);
        const classified = classifyStoredValue(raw, item.key);
        return { ...item, ...classified } satisfies HealthRow;
      } catch (error) {
        reportNonFatalError("storage-health:read", error, { key: item.key });
        return { ...item, status: "unavailable", count: 0 } satisfies HealthRow;
      }
    }));
    setRows(results);
    if (results.some((item) => item.status === "unavailable")) setMessage("Some storage areas could not be checked. Private content was not opened or displayed.");
    setLoading(false);
  }, []);

  useEffect(() => { void loadHealth(); }, [loadHealth]);

  const backupMalformed = async (key: string, label: string) => {
    try {
      const rawValue = await AsyncStorage.getItem(key);
      if (!rawValue) {
        setMessage(`No backup was created because ${label} is no longer available.`);
        return;
      }
      await Clipboard.setStringAsync(JSON.stringify({ key, label, rawValue }, null, 2));
      setBackupCopied(true);
      setMessage(`A local backup of ${label} was copied to your clipboard. Clipboard contents may be visible to other apps.`);
    } catch (error) {
      reportNonFatalError("storage-health:backup", error, { key });
      setMessage(`Could not copy a backup of ${label}. The saved value was not changed.`);
    }
  };

  const repairMalformed = async (key: string, label: string) => {
    try {
      await AsyncStorage.removeItem(key);
      setRepairTarget(null);
      setBackupCopied(false);
      setMessage(`${label} was cleared because its saved format was unreadable. Other local data was not changed.`);
      await loadHealth();
    } catch (error) {
      reportNonFatalError("storage-health:repair", error, { key });
      setMessage(`Could not repair ${label} right now. Your local data was not changed.`);
    }
  };

  const unavailableCount = rows.filter((row) => row.status === "unavailable").length;
  const malformedCount = rows.filter((row) => row.status === "malformed").length;
  const availableCount = rows.filter((row) => row.status === "available").length;

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}><Pressable accessibilityRole="button" accessibilityLabel="Return to Profile" onPress={() => router.back()} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.eyebrow}>LOCAL DIAGNOSTICS</Text><View style={styles.spacer} /></View>
        <FadeInView duration={300} distance={8}><Text style={styles.title}>Your data, accounted for.</Text><Text style={styles.subtitle}>A private health check for on-device storage. We show status and counts only—not journal words, images, or AI content.</Text></FadeInView>
        <View style={styles.summary}><View><Text style={styles.summaryNumber}>{loading ? "—" : availableCount}</Text><Text style={styles.summaryLabel}>areas available</Text></View><View><Text style={styles.summaryNumber}>{loading ? "—" : unavailableCount}</Text><Text style={styles.summaryLabel}>areas needing a retry</Text></View><View><Text style={styles.summaryNumber}>{loading ? "—" : malformedCount}</Text><Text style={styles.summaryLabel}>areas needing repair</Text></View></View>
        {message ? <Text accessibilityLiveRegion="polite" accessibilityRole="text" style={styles.message}>{message}</Text> : null}
        <View style={styles.rows}>{loading ? <Text accessibilityLiveRegion="polite" style={styles.loading}>Checking local storage…</Text> : rows.map((row) => <View key={row.key} style={styles.row}><View style={styles.rowCopy}><Text style={styles.rowLabel}>{row.label}</Text><Text style={styles.rowMeta}>{row.private ? "Private content · status only" : "Local activity · status only"}{row.status === "available" ? ` · ${row.count} ${row.count === 1 ? "record" : "records"}` : ""}</Text></View>{row.status === "malformed" ? repairTarget?.key === row.key ? <View style={styles.repairConfirm}><Text style={styles.repairHint}>Clear only this unreadable saved value? You can copy a local backup first.</Text><View style={styles.repairActions}><Pressable accessibilityRole="button" accessibilityLabel={`Copy a local backup of ${row.label}`} onPress={() => void backupMalformed(row.key, row.label)} style={({ pressed }) => [styles.backupRepair, pressed && styles.pressed]}><Text style={styles.backupRepairText}>{backupCopied ? "Copied" : "Copy backup"}</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel={`Confirm repair for ${row.label}`} onPress={() => void repairMalformed(row.key, row.label)} style={({ pressed }) => [styles.repair, pressed && styles.pressed]}><Text style={styles.repairText}>Confirm</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Cancel repair" onPress={() => setRepairTarget(null)} style={({ pressed }) => [styles.cancelRepair, pressed && styles.pressed]}><Text style={styles.cancelRepairText}>Cancel</Text></Pressable></View></View> : <Pressable accessibilityRole="button" accessibilityLabel={`Repair malformed ${row.label}`} onPress={() => { setRepairTarget(row); setBackupCopied(false); }} style={({ pressed }) => [styles.repair, pressed && styles.pressed]}><Text style={styles.repairText}>Repair</Text></Pressable> : <Text accessibilityLabel={`${row.label}: ${row.status}`} style={[styles.status, row.status === "available" ? styles.good : row.status === "unavailable" ? styles.bad : styles.neutral]}>{row.status === "available" ? "Ready" : row.status === "unavailable" ? "Retry" : "Empty"}</Text>}</View>)}</View>
        {!loading ? <Pressable accessibilityRole="button" accessibilityLabel="Retry checking local storage" onPress={() => void loadHealth()} style={({ pressed }) => [styles.retry, pressed && styles.pressed]}><Text style={styles.retryText}>Check again</Text></Pressable> : null}
        <Text style={styles.privacy}>This screen never sends local storage contents to AI or a server.</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { padding: 20, paddingBottom: 48 }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }, back: { width: 40 }, backText: { color: "#2B1D2F", fontSize: 36, lineHeight: 36 }, spacer: { width: 40 }, eyebrow: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 1.7 }, title: { color: "#2B1D2F", fontSize: 34, lineHeight: 39, fontWeight: "700" }, subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 22, marginTop: 12 }, summary: { flexDirection: "row", gap: 12, marginTop: 24 }, summaryNumber: { color: "#2B1D2F", fontSize: 26, fontWeight: "700" }, summaryLabel: { color: "#7E6F7D", fontSize: 11, marginTop: 3 }, message: { color: "#A34C4C", fontSize: 12, lineHeight: 18, marginTop: 16 }, rows: { marginTop: 22, gap: 8 }, loading: { color: "#7E6F7D", fontSize: 14, paddingVertical: 20 }, row: { backgroundColor: "#FFF7F2", borderRadius: 15, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, rowCopy: { flex: 1, paddingRight: 12 }, rowLabel: { color: "#2B1D2F", fontSize: 14, fontWeight: "700" }, rowMeta: { color: "#7E6F7D", fontSize: 11, lineHeight: 16, marginTop: 4 }, status: { borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6, fontSize: 11, fontWeight: "800" }, good: { color: "#35634A", backgroundColor: "#D8E1D5" }, bad: { color: "#A34C4C", backgroundColor: "#F5D7CF" }, neutral: { color: "#7E6F7D", backgroundColor: "#F3E5E1" }, retry: { alignSelf: "flex-start", backgroundColor: "#2B1D2F", borderRadius: 13, paddingHorizontal: 16, paddingVertical: 12, marginTop: 20 }, retryText: { color: "#FFF7F2", fontSize: 12, fontWeight: "700" }, repair: { backgroundColor: "#F5D7CF", borderRadius: 10, paddingHorizontal: 9, paddingVertical: 6 }, repairText: { color: "#A34C4C", fontSize: 11, fontWeight: "800" }, repairConfirm: { alignItems: "flex-end", maxWidth: 160 }, repairHint: { color: "#A34C4C", fontSize: 10, lineHeight: 14, textAlign: "right" }, repairActions: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap", justifyContent: "flex-end" }, backupRepair: { backgroundColor: "#E7D9C6", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 }, backupRepairText: { color: "#5F4A5E", fontSize: 11, fontWeight: "700" }, cancelRepair: { backgroundColor: "#F3E5E1", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6 }, cancelRepairText: { color: "#7E4E54", fontSize: 11, fontWeight: "700" }, privacy: { color: "#9C8D99", fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: 22 }, pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] }, });
