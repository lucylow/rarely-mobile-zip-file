import { useCallback, useMemo, useState } from "react";
import { Alert, FlatList, Image, Platform, Pressable, RefreshControl, Share, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { ScreenContainer } from "@/components/screen-container";
import { getMembershipLabel, isPremiumActive, loadMonetizationState } from "@/lib/ux/monetization";
import { loadLocalActivitySnapshot } from "@/lib/ux/localActivity";
import { resetKeysBestEffort } from "@/lib/ux/localReset";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { triggerLightImpact } from "@/lib/ux/haptics";
import { getJournalExportMode, prepareJournalExportText } from "@/lib/ux/export";
import { FadeInView } from "@/components/ui/fade-in-view";

const highlights = [
  { id: "journal", value: "00", label: "thoughts kept", color: "#F5D7CF" },
  { id: "moments", value: "00", label: "rare moments", color: "#D9CDE7" },
  { id: "circles", value: "00", label: "circles joined", color: "#F8E3A8" },
  { id: "routines", value: "00", label: "rituals completed", color: "#F6C7B7" },
];

type RecordDateKey = "completedAt" | "joinedAt";

function parseTimestamp(value: string | undefined): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY;
}

function latestByDate<T extends Record<string, unknown>>(records: T[], dateKey: RecordDateKey): T | undefined {
  return records.reduce<T | undefined>((latest, current) => {
    const latestTime = parseTimestamp(latest?.[dateKey] as string | undefined);
    const currentTime = parseTimestamp(current[dateKey] as string | undefined);
    return currentTime > latestTime ? current : latest;
  }, undefined);
}

function activityTimestamp(record: { completedAt?: string; joinedAt?: string }): string | undefined {
  return record.completedAt ?? record.joinedAt;
}

function formatDateLabel(value: string | null, options: Intl.DateTimeFormatOptions): string {
  if (!value) return "";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return date.toLocaleDateString(undefined, options);
}

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function ProfileScreen() {
  const [completedCount, setCompletedCount] = useState(0);
  const [journalCount, setJournalCount] = useState(0);
  const [joinedCount, setJoinedCount] = useState(0);
  const [routineCount, setRoutineCount] = useState(0);
  const [latestCircleAt, setLatestCircleAt] = useState<string | null>(null);
  const [latestRoutineAt, setLatestRoutineAt] = useState<string | null>(null);
  const [latestMomentAt, setLatestMomentAt] = useState<string | null>(null);
  const [latestActivityName, setLatestActivityName] = useState<string | null>(null);
  const [latestCircleName, setLatestCircleName] = useState<string | null>(null);
  const [latestRoutineName, setLatestRoutineName] = useState<string | null>(null);
  const [latestMomentName, setLatestMomentName] = useState<string | null>(null);
  const [latestCircleId, setLatestCircleId] = useState<string | null>(null);
  const [latestRoutineId, setLatestRoutineId] = useState<string | null>(null);
  const [latestMomentId, setLatestMomentId] = useState<string | null>(null);
  const [membershipLabel, setMembershipLabel] = useState("Rarely free");
  const [membershipActive, setMembershipActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [unavailableActivityKeys, setUnavailableActivityKeys] = useState<string[]>([]);
  const [profileDataFallback, setProfileDataFallback] = useState(false);
  const resetComputedState = useCallback(() => {
    setCompletedCount(0);
    setJournalCount(0);
    setJoinedCount(0);
    setRoutineCount(0);
    setLatestCircleAt(null);
    setLatestRoutineAt(null);
    setLatestMomentAt(null);
    setLatestActivityName(null);
    setLatestCircleName(null);
    setLatestRoutineName(null);
    setLatestMomentName(null);
    setLatestCircleId(null);
    setLatestRoutineId(null);
    setLatestMomentId(null);
    setMembershipLabel("Rarely free");
    setMembershipActive(false);
  }, []);

  const loadProfileData = useCallback(async (isActive: () => boolean) => {
    try {
      const [activity, monetizationState] = await Promise.all([
        loadLocalActivitySnapshot(),
        loadMonetizationState(AsyncStorage),
      ]);
      if (!isActive()) return;
      setUnavailableActivityKeys(activity.unavailableKeys);
      setProfileDataFallback(false);

      const moments = activity.moments;
      setCompletedCount(moments.length);
      const latestMoment = latestByDate(moments, "completedAt");
      setLatestMomentAt(latestMoment?.completedAt ?? null);
      setLatestMomentName(latestMoment?.name ?? null);
      setLatestMomentId(latestMoment?.id ?? null);
      setJournalCount(activity.journal.length);
      const circles = activity.circles;
      const routines = activity.routines;
      setJoinedCount(circles.length);
      setRoutineCount(routines.length);
      const latestCircle = latestByDate(circles, "joinedAt");
      const latestRoutine = latestByDate(routines, "completedAt");
      setLatestCircleAt(latestCircle?.joinedAt ?? null);
      setLatestRoutineAt(latestRoutine?.completedAt ?? null);
      setLatestCircleName(latestCircle?.name ?? null);
      setLatestRoutineName(latestRoutine?.name ?? null);
      setLatestCircleId(latestCircle?.id ?? null);
      setLatestRoutineId(latestRoutine?.id ?? null);
      const latestNamed = [latestMoment, ...circles, ...routines]
        .filter((item): item is NonNullable<typeof item> => Boolean(item?.name))
        .reduce<NonNullable<typeof latestMoment> | undefined>((latest, current) => {
          return parseTimestamp(activityTimestamp(current)) > parseTimestamp(activityTimestamp(latest ?? {}))
            ? current
            : latest;
        }, undefined);
      setLatestActivityName(latestNamed?.name ?? null);
      setMembershipLabel(getMembershipLabel(monetizationState));
      setMembershipActive(isPremiumActive(monetizationState));
    } catch (error) {
      console.error("[Profile] Failed to load profile data:", error);
      if (!isActive()) return;
      resetComputedState();
      setProfileDataFallback(true);
    }
  }, [resetComputedState]);

  useAsyncFocusEffect(loadProfileData, [loadProfileData]);

  const profileHighlights = useMemo(() => {
    return highlights.map((item) =>
      item.id === "journal"
        ? { ...item, value: String(journalCount).padStart(2, "0") }
        : item.id === "moments"
          ? { ...item, value: String(completedCount).padStart(2, "0") }
          : item.id === "circles"
            ? { ...item, value: String(joinedCount).padStart(2, "0") }
            : { ...item, value: String(routineCount).padStart(2, "0") },
    );
  }, [completedCount, joinedCount, journalCount, routineCount]);

  const showProfileFallback = profileDataFallback || unavailableActivityKeys.length > 0;
  const totalReflections = completedCount + journalCount + joinedCount + routineCount;

  const reflectionBody = useMemo(() => {
    if (totalReflections === 0) {
      return "Start with one small moment today. It can be enough.";
    }
    return `You have saved ${pluralize(journalCount, "thought", "thoughts")}, completed ${pluralize(completedCount, "moment", "moments")}, joined ${pluralize(joinedCount, "circle", "circles")}, and finished ${pluralize(routineCount, "ritual", "rituals")}. Keep noticing what feels like you.`;
  }, [completedCount, journalCount, joinedCount, routineCount, totalReflections]);

  const activityMeta = useMemo(() => {
    const segments: string[] = [];
    if (latestActivityName) {
      segments.push(latestActivityName);
    }
    const momentLabel = formatDateLabel(latestMomentAt, { month: "short", day: "numeric" });
    const circleLabel = formatDateLabel(latestCircleAt, { month: "short", day: "numeric" });
    const routineLabel = formatDateLabel(latestRoutineAt, { month: "short", day: "numeric" });
    if (momentLabel) segments.push(`Last moment: ${momentLabel}`);
    if (circleLabel) segments.push(`Last circle: ${circleLabel}`);
    if (routineLabel) segments.push(`Last ritual: ${routineLabel}`);
    return segments.length ? segments.join("  ·  ") : null;
  }, [latestActivityName, latestCircleAt, latestMomentAt, latestRoutineAt]);

  const openScrapbook = useCallback(() => {
    void triggerLightImpact();
    router.push("/scrapbook");
  }, []);

  const openHighlight = useCallback((id: string) => {
    if (id === "journal") {
      if (journalCount === 0) {
        Alert.alert("No saved journal yet", "Write a journal entry first, then you can revisit it here.");
        return;
      }
      void triggerLightImpact();
      router.push("/journal-library");
      return;
    }
    if (id === "moments") {
      if (completedCount === 0) {
        Alert.alert("No moments yet", "Start a moment on Home and it will appear here.");
        return;
      }
      void triggerLightImpact();
      router.push({ pathname: "/activity", params: { kind: "moment", id: latestMomentId ?? undefined, title: latestMomentName ?? "Rare Moments", date: latestMomentAt } });
      return;
    }
    if (id === "circles") {
      if (joinedCount === 0) {
        Alert.alert("No circles joined yet", "Join a circle in Community and it will show up here.");
        return;
      }
      void triggerLightImpact();
      router.push({ pathname: "/activity", params: { kind: "circle", id: latestCircleId ?? undefined, title: latestCircleName ?? "Joined Community circles", date: latestCircleAt } });
      return;
    }
    if (routineCount === 0) {
      Alert.alert("No routines completed yet", "Try a routine in Studio and it will appear here.");
      return;
    }
    void triggerLightImpact();
    router.push({ pathname: "/activity", params: { kind: "routine", id: latestRoutineId ?? undefined, title: latestRoutineName ?? "Completed Studio rituals", date: latestRoutineAt } });
  }, [completedCount, journalCount, joinedCount, latestCircleAt, latestCircleId, latestCircleName, latestMomentAt, latestMomentId, latestMomentName, latestRoutineAt, latestRoutineId, latestRoutineName, routineCount]);
  const resetLocalData = () => {
    Alert.alert("Reset local data?", "This removes saved journal entries, drafts, and completed moments from this device.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: async () => {
        const result = await resetKeysBestEffort(AsyncStorage, ["rarely.journalEntries", "rarely.journalDraft", "rarely.completedMoments", "rarely.joinedCircles", "rarely.completedRoutines"]);
        if (result.failedKeys.length === 0) {
          setJournalCount(0); setCompletedCount(0); setJoinedCount(0); setRoutineCount(0);
          setLatestCircleAt(null); setLatestRoutineAt(null); setLatestMomentAt(null);
          setLatestActivityName(null); setLatestCircleName(null); setLatestRoutineName(null); setLatestMomentName(null);
          setLatestCircleId(null); setLatestRoutineId(null); setLatestMomentId(null);
          Alert.alert("Local data reset", "Your RARELY reflections are now cleared from this device.");
        } else if (result.clearedKeys.length > 0) {
          Alert.alert("Reset partly completed", "Some local data was cleared, but a few items remain on this device. Try again when storage is available.");
          void loadProfileData(() => true);
        } else {
          Alert.alert("Reset unavailable", "We couldn't clear local data right now. Please try again.");
        }
      } },
    ]);
  };
  const exportJournal = async () => {
    try {
      const { journal: entries } = await loadLocalActivitySnapshot();
      const text = prepareJournalExportText(entries);
      if (!text) { Alert.alert("Nothing to export", "Save a journal entry first, then you can take it with you."); return; }
      if (getJournalExportMode(Platform.OS, false) === "web-share") {
        await Share.share({ message: text, title: "RARELY journal" });
        return;
      }
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (getJournalExportMode(Platform.OS, sharingAvailable) === "unavailable") {
        Alert.alert("Sharing unavailable", "Your journal is ready, but this device cannot open a sharing sheet right now.");
        return;
      }
      const fileUri = `${FileSystem.documentDirectory}rarely-journal.txt`;
      if (!fileUri) {
        Alert.alert("Export unavailable", "This device does not provide local file storage for an export.");
        return;
      }
      await FileSystem.writeAsStringAsync(fileUri, text, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { dialogTitle: "Share your RARELY journal", mimeType: "text/plain" });
    } catch (error) {
      console.error("[Profile] Failed to export journal:", error);
      Alert.alert("Export failed", "We couldn't export your journal right now. Please try again.");
    }
  };
  const refreshProfile = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadProfileData(() => true);
    } finally {
      setRefreshing(false);
    }
  }, [loadProfileData]);

  return (
    <ScreenContainer className="px-5 pt-5">
      <FlatList
        data={profileHighlights}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshProfile} tintColor="#2B1D2F" colors={["#2B1D2F"]} />}
        ListHeaderComponent={
          <FadeInView duration={320}>
            <View style={styles.profileHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>r</Text>
              </View>
              <View>
                <Text style={styles.eyebrow}>YOUR SPACE</Text>
                <Text style={styles.title}>More you, lately.</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>A private scrapbook of the things that made you feel like yourself.</Text>
            {showProfileFallback ? <View accessibilityLiveRegion="polite" style={styles.recoveryCard}><Text style={styles.recoveryKicker}>PRIVATE PREVIEW MODE</Text><Text style={styles.recoveryTitle}>Your saved highlights are temporarily unavailable.</Text><Text style={styles.recoveryBody}>RARELY is showing a small example instead of inventing counts. Your private words and images were not opened or sent anywhere.</Text><View style={styles.recoveryExamples}><Text style={styles.recoveryExample}>• A quiet morning moment</Text><Text style={styles.recoveryExample}>• A note worth returning to</Text></View><Pressable accessibilityRole="button" accessibilityLabel="Retry loading private profile highlights" onPress={refreshProfile} style={({ pressed }) => [styles.recoveryButton, pressed && styles.pressed]}><Text style={styles.recoveryButtonText}>Retry private highlights</Text></Pressable></View> : null}
            <View style={styles.yearCard}>
              <Image
                source={{ uri: "/manus-storage/rarely-profile-archive_1f2c02c6.png" }}
                resizeMode="cover"
                accessibilityLabel="Personal scrapbook archive visual"
                style={styles.yearVisual}
              />
              <Text style={styles.yearKicker}>YOUR YEAR IN YOU</Text>
              <Text style={styles.yearTitle}>The story is still becoming.</Text>
              <Text style={styles.yearBody}>Save little moments now. We’ll help you notice the shape they make over time.</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="View your chronological scrapbook"
                onPress={openScrapbook}
                style={({ pressed }) => [styles.yearButton, pressed && styles.pressed]}
              >
                <Text style={styles.yearButtonText}>View scrapbook</Text>
                <Text style={styles.yearArrow}>↗</Text>
              </Pressable>
            </View>
            <Text style={styles.section}>Your highlights</Text>
            <View style={styles.reflection}>
              <Text style={styles.reflectionKicker}>A LITTLE REFLECTION</Text>
              <Text style={styles.reflectionTitle}>You made space for yourself.</Text>
              <Text style={styles.reflectionBody}>{reflectionBody}</Text>
              {activityMeta ? <Text style={styles.activityMeta}>{activityMeta}</Text> : null}
            </View>
          </FadeInView>
        }
        renderItem={({ item, index }) => (
          <FadeInView delay={Math.min(index * 45, 180)} duration={300}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.value} ${item.label}. Open related activity`}
            onPress={() => openHighlight(item.id)}
            style={({ pressed }) => [styles.stat, { backgroundColor: item.color }, pressed && styles.pressed]}
          >
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
            <Text style={styles.statArrow}>→</Text>
          </Pressable>
          </FadeInView>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              onPress={() => router.push({ pathname: "/membership", params: { source: "profile" } } as never)}
              style={({ pressed }) => [[styles.settings, membershipActive ? styles.membershipActiveRow : styles.membershipRow], pressed && styles.pressed]}
            >
              <Text style={styles.settingsIcon}>{membershipActive ? "✦" : "♡"}</Text>
              <View style={styles.membershipCopy}>
                <Text style={styles.settingsText}>{membershipActive ? "Manage Rarely Plus" : "Unlock Rarely Plus"}</Text>
                <Text style={styles.membershipMeta}>{membershipLabel}</Text>
              </View>
              <Text style={styles.settingsArrow}>→</Text>
            </Pressable>
            <Pressable onPress={exportJournal} style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
              <Text style={styles.settingsIcon}>↗</Text>
              <Text style={styles.settingsText}>Export saved journal</Text>
              <Text style={styles.settingsArrow}>→</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/preferences")} style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
              <Text style={styles.settingsIcon}>⚙</Text>
              <Text style={styles.settingsText}>Preferences</Text>
              <Text style={styles.settingsArrow}>→</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/storage-health" as never)} accessibilityRole="button" accessibilityLabel="Open local storage health diagnostics" style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
              <Text style={styles.settingsIcon}>◌</Text>
              <View style={styles.membershipCopy}>
                <Text style={styles.settingsText}>Storage health</Text>
                <Text style={styles.membershipMeta}>Check local data status without opening private content</Text>
              </View>
              <Text style={styles.settingsArrow}>→</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/monetization-insights" as never)} style={({ pressed }) => [styles.settings, pressed && styles.pressed]}>
              <Text style={styles.settingsIcon}>◍</Text>
              <Text style={styles.settingsText}>Monetization insights</Text>
              <Text style={styles.settingsArrow}>→</Text>
            </Pressable>
            <Pressable onPress={resetLocalData} style={({ pressed }) => [styles.reset, pressed && styles.pressed]}>
              <Text style={styles.resetText}>Reset local data</Text>
            </Pressable>
            <Text style={styles.privacy}>
              Your reflections stay yours. RARELY is a space for expression, not comparison.
            </Text>
          </View>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ content: { paddingBottom: 30, gap: 10 }, profileHeader: { flexDirection: "row", alignItems: "center", gap: 14 }, avatar: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#D9CDE7", alignItems: "center", justifyContent: "center" }, avatarText: { color: "#2B1D2F", fontSize: 28, fontWeight: "700", fontStyle: "italic" }, eyebrow: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 2.2 }, title: { color: "#2B1D2F", fontSize: 26, fontWeight: "700", marginTop: 4 }, subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 21, marginTop: 15 }, yearCard: { borderRadius: 25, backgroundColor: "#2B1D2F", padding: 20, marginTop: 22, overflow: "hidden" }, yearVisual: { width: "100%", height: 118, borderRadius: 19, marginBottom: 5 }, yearKicker: { color: "#F28A7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.6 }, yearTitle: { color: "#FFF7F2", fontSize: 22, fontWeight: "700", marginTop: 16 }, yearBody: { color: "#C6B9C4", fontSize: 14, lineHeight: 20, marginTop: 7 }, yearButton: { backgroundColor: "#FFF7F2", borderRadius: 16, padding: 14, marginTop: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] }, yearButtonText: { color: "#2B1D2F", fontSize: 14, fontWeight: "700" }, yearArrow: { color: "#2B1D2F", fontSize: 18 },   section: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 26, marginBottom: 2 }, recoveryCard: { backgroundColor: "#FFF7F2", borderColor: "#E5D8D4", borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 18 }, recoveryKicker: { color: "#E96F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.4 }, recoveryTitle: { color: "#2B1D2F", fontSize: 17, lineHeight: 22, fontWeight: "700", marginTop: 8 }, recoveryBody: { color: "#7E6F7D", fontSize: 12, lineHeight: 18, marginTop: 6 }, recoveryExamples: { marginTop: 10, gap: 4 }, recoveryExample: { color: "#5F4A5E", fontSize: 12, lineHeight: 17 }, recoveryButton: { alignSelf: "flex-start", backgroundColor: "#2B1D2F", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 14 }, recoveryButtonText: { color: "#FFF7F2", fontSize: 12, fontWeight: "700" },
  reflection: { backgroundColor: "#F8E3A8", borderRadius: 21, padding: 17, marginTop: 13 },
  reflectionKicker: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  reflectionTitle: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 10 },
  reflectionBody: { color: "#5F4A5E", fontSize: 13, lineHeight: 19, marginTop: 5 }, activityMeta: { color: "#7E6F7D", fontSize: 11, lineHeight: 16, marginTop: 10 }, stat: { borderRadius: 20, padding: 17, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, statValue: { color: "#2B1D2F", fontSize: 24, fontWeight: "700" }, statLabel: { color: "#5F4A5E", fontSize: 13, fontWeight: "600", flex: 1, marginLeft: 10 }, statArrow: { color: "#2B1D2F", fontSize: 18 }, footer: { marginTop: 18 }, membershipRow: { backgroundColor: "#FFF4E8", borderColor: "#F1D5C3" }, membershipActiveRow: { backgroundColor: "#EEE7F8", borderColor: "#D9CDE7" }, settings: { borderColor: "#EDE4E0", borderWidth: 1, backgroundColor: "#FFFFFF", borderRadius: 18, padding: 15, flexDirection: "row", alignItems: "center", gap: 11 }, membershipCopy: { flex: 1 }, membershipMeta: { color: "#7E6F7D", fontSize: 11, lineHeight: 14, marginTop: 2 }, settingsIcon: { color: "#E96F61", fontSize: 18 }, settingsText: { color: "#2B1D2F", fontSize: 14, fontWeight: "700", flex: 1 }, settingsArrow: { color: "#2B1D2F", fontSize: 18 },   privacy: { color: "#9C8D99", fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: 18, paddingHorizontal: 12 }, reset: { alignItems: "center", paddingVertical: 14 }, resetText: { color: "#B96861", fontSize: 13, fontWeight: "700" }, });
