import { useEffect, useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import { normalizedParam, runGuarded } from "@/lib/ux/guards";
import { parseActivityRecords, type LocalActivityRecord } from "@/lib/ux/localStorage";
import { ScreenContainer } from "@/components/screen-container";
import { PrivacyStatus } from "@/components/ui/privacy-status";
import { Snackbar } from "@/components/ui/snackbar";

type ActivityKind = "moment" | "circle" | "routine";
type ActivityRecord = LocalActivityRecord;

function parseActivityKind(value: string | undefined): ActivityKind {
  return value === "circle" || value === "routine" || value === "moment" ? value : "moment";
}

function formatActivityDate(value: string | undefined): string {
  if (!value) return "Saved locally";
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return "Saved locally";
  return parsed.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

function normalizeRecordDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return Number.isFinite(Date.parse(value)) ? value : undefined;
}

const storageKey: Record<ActivityKind, string> = {
  moment: "rarely.completedMoments",
  circle: "rarely.joinedCircles",
  routine: "rarely.completedRoutines",
};

const activityVisuals: Record<ActivityKind, string> = {
  moment: "/manus-storage/rarely-mood-creative_c6771dad.png",
  circle: "/manus-storage/rarely-mood-reflective_2709022d.png",
  routine: "/manus-storage/rarely-mood-calm_afcc209c.png",
};

const activityVisualSequences: Record<ActivityKind, { uri: string; label: string }[]> = {
  moment: [
    { uri: activityVisuals.moment, label: "Rare Moment atmosphere" },
    { uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png", label: "Moment color texture" },
    { uri: "/manus-storage/rarely-card-movement_ff8eddc9.png", label: "Moment movement texture" },
  ],
  circle: [
    { uri: activityVisuals.circle, label: "Community atmosphere" },
    { uri: "/manus-storage/rarely-community-circle_4172fac0.png", label: "Community circle texture" },
    { uri: "/manus-storage/rarely-community-listening_7a89c428.png", label: "Listening texture" },
  ],
  routine: [
    { uri: activityVisuals.routine, label: "Studio atmosphere" },
    { uri: "/manus-storage/rarely-studio-making_74b6fbec.png", label: "Making texture" },
    { uri: "/manus-storage/rarely-studio-focus_85abd483.png", label: "Focus texture" },
  ],
};

const copy: Record<ActivityKind, { label: string; color: string; defaultTitle: string; defaultBody: string; action: string }> = {
  moment: { label: "RARE MOMENT", color: "#D9CDE7", defaultTitle: "A moment you made meaningful", defaultBody: "A small pause you chose to give yourself.", action: "Return to Home" },
  circle: { label: "COMMUNITY", color: "#F8E3A8", defaultTitle: "A circle you joined", defaultBody: "A private record of a place where curiosity had room to meet other people.", action: "Return to Community" },
  routine: { label: "RARE STUDIO", color: "#F6C7B7", defaultTitle: "A ritual you completed", defaultBody: "A creative routine you made space to try.", action: "Return to Studio" },
};

export default function ActivityScreen() {
  const params = useLocalSearchParams<{
    kind?: string | string[];
    id?: string | string[];
    title?: string | string[];
    body?: string | string[];
    date?: string | string[];
    note?: string | string[];
  }>();
  const kind = parseActivityKind(normalizedParam(params.kind));
  const id = normalizedParam(params.id);
  const title = normalizedParam(params.title);
  const body = normalizedParam(params.body);
  const date = normalizedParam(params.date);
  const noteText = normalizedParam(params.note);
  const detail = copy[kind] ?? copy.moment;
  const [reversed, setReversed] = useState(false);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteDraft, setNoteDraft] = useState("");
  const [savedImageUri, setSavedImageUri] = useState<string | null>(null);
  const [showNotePreviews, setShowNotePreviews] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [mutatingActivity, setMutatingActivity] = useState(false);
  const [recordUnavailable, setRecordUnavailable] = useState(false);
  const formattedDate = formatActivityDate(date);

  useEffect(() => {
    let active = true;
    void runGuarded(
      () => AsyncStorage.getItem("rarely.showActivityNotePreviews"),
      () => {
        if (!active) return;
        setSnackbar("Could not load note preview preference");
      },
    ).then((value) => {
      if (!active || value === undefined) return;
      setShowNotePreviews(value !== "false");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    let active = true;
    void runGuarded(
      () => AsyncStorage.getItem(storageKey[kind]),
      () => {
        if (!active) return;
        setSnackbar("Could not load this activity");
      },
    ).then((value) => {
      if (!active || value === undefined) return;
      const record = parseActivityRecords(value).find((item) => item.id === id);
      setRecordUnavailable(!record);
      setNote(record?.note ?? "");
      setNoteDraft(record?.note ?? "");
      setImageUri(record?.imageUri ?? null);
      setSavedImageUri(record?.imageUri ?? null);
    });
    return () => {
      active = false;
    };
  }, [id, kind]);

  const toggleNotePreviews = async (value: boolean) => {
    const previous = showNotePreviews;
    setShowNotePreviews(value);
    const saved = await runGuarded(
      () => AsyncStorage.setItem("rarely.showActivityNotePreviews", String(value)),
      undefined,
    );
    if (saved === undefined) {
      setShowNotePreviews(previous);
      setSnackbar("Could not update note preview setting");
      return;
    }
    setSnackbar(value ? "Private note previews shown" : "Private note previews hidden");
  };

  const saveNote = async (): Promise<boolean> => {
    if (!id || savingNote) return false;
    setSavingNote(true);
    const saved = await runGuarded(async () => {
      const current = parseActivityRecords(await AsyncStorage.getItem(storageKey[kind]));
      if (!current.some((item) => item.id === id)) {
        setSnackbar("This activity is no longer available");
        return undefined;
      }
      const next = current.map((item) => item.id === id ? { ...item, note: noteDraft.trim() || undefined, imageUri: imageUri ?? undefined } : item);
      await AsyncStorage.setItem(storageKey[kind], JSON.stringify(next));
      setNote(noteDraft.trim());
      setSavedImageUri(imageUri);
      setSnackbar(noteDraft.trim() ? "Private note saved" : "Private note cleared");
      return true;
    }, () => {
      setSnackbar("Could not save note right now");
      return undefined;
    });
    setSavingNote(false);
    return saved === true;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [4, 3], quality: 0.85 });
      if (result.canceled) return;
      const selectedUri = result.assets[0]?.uri;
      if (selectedUri) {
        setImageUri(selectedUri);
        setSnackbar("A private image was added to this activity");
      }
    } catch {
      setSnackbar("Could not add image right now");
    }
  };

  const reverseActivity = async () => {
    if (!id || mutatingActivity) return;
    setMutatingActivity(true);
    const removed = await runGuarded(async () => {
      const current = parseActivityRecords(await AsyncStorage.getItem(storageKey[kind]));
      if (!current.some((item) => item.id === id)) {
        setSnackbar("This activity is already removed");
        return false;
      }
      await AsyncStorage.setItem(storageKey[kind], JSON.stringify(current.filter((item) => item.id !== id)));
      return true;
    }, () => {
      setSnackbar("Could not remove this activity right now");
      return false;
    });
    if (removed) {
      setReversed(true);
      setSnackbar(`${title || detail.defaultTitle} removed from your activity`);
    }
    setMutatingActivity(false);
  };

  const confirmReverse = () => Alert.alert("Remove this activity?", "It will be removed from your local Profile and Scrapbook history.", [{ text: "Keep it", style: "cancel" }, { text: "Remove", style: "destructive", onPress: reverseActivity }]);

  const undoReverse = async () => {
    if (!id || mutatingActivity) return;
    setMutatingActivity(true);
    const restored = await runGuarded(async () => {
      const current = parseActivityRecords(await AsyncStorage.getItem(storageKey[kind]));
      const record: ActivityRecord = {
        id,
        name: title,
        note: note || undefined,
        imageUri: imageUri ?? undefined,
        ...(kind === "circle"
          ? { joinedAt: normalizeRecordDate(date) }
          : { completedAt: normalizeRecordDate(date) }),
      };
      await AsyncStorage.setItem(storageKey[kind], JSON.stringify([...current.filter((item) => item.id !== id), record]));
      return true;
    }, () => {
      setSnackbar("Could not restore this activity");
      return false;
    });
    if (restored) {
      setReversed(false);
      setSnackbar(`${title || detail.defaultTitle} restored`);
    }
    setMutatingActivity(false);
  };

  const returnToSource = () => {
    if (kind === "circle") router.replace("/(tabs)/community");
    else if (kind === "routine") router.replace("/(tabs)/studio");
    else router.replace("/(tabs)");
  };

  const noteUnchanged = noteDraft.trim() === note;
  const imageUnchanged = imageUri === savedImageUri;
  const hasPendingActivityChanges = !(noteUnchanged && imageUnchanged);
  const handleBack = () => {
    if (!hasPendingActivityChanges) {
      router.back();
      return;
    }
    Alert.alert("Unsaved private note", "Save your activity changes before leaving?", [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => router.back() },
      {
        text: "Save and leave",
        onPress: async () => {
          const didSave = await saveNote();
          if (didSave) {
            router.back();
          }
        },
      },
    ]);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable accessibilityRole="button" accessibilityLabel="Go back" onPress={handleBack} style={({ pressed }) => [styles.back, pressed && styles.pressed]}><Text style={styles.backText}>‹</Text></Pressable>
        <View style={[styles.hero, { backgroundColor: detail.color }]}><Image source={{ uri: activityVisuals[kind] }} resizeMode="cover" accessibilityLabel={`${detail.label.toLowerCase()} visual`} style={styles.heroVisual} /><View accessibilityLabel={`${detail.label.toLowerCase()} visual layers`} style={styles.heroLayers}>{activityVisualSequences[kind].slice(1).map((visual) => <Image key={visual.uri} source={{ uri: visual.uri }} resizeMode="cover" accessibilityLabel={visual.label} style={styles.heroLayer} />)}</View><Text style={styles.label}>{detail.label}</Text><Text style={styles.title}>{title || detail.defaultTitle}</Text><Text style={styles.body}>{showNotePreviews ? (body || detail.defaultBody) : (noteText ? detail.defaultBody : (body || detail.defaultBody))}</Text></View>
        {recordUnavailable ? <View accessibilityLiveRegion="polite" style={styles.recoveryCard}><Text style={styles.recoveryTitle}>This local activity is no longer available.</Text><Text style={styles.recoveryBody}>RARELY is showing a private example of this activity type. No note or image was recreated, and your remaining local memories were not changed.</Text><Pressable accessibilityRole="button" accessibilityLabel={detail.action} onPress={returnToSource} style={({ pressed }) => [styles.recoveryButton, pressed && styles.pressed]}><Text style={styles.recoveryButtonText}>{detail.action}</Text></Pressable></View> : null}
        <PrivacyStatus visible={showNotePreviews} />
        <View style={styles.meta}><Text style={styles.metaLabel}>LOCAL MEMORY</Text><Text accessibilityLabel={`Saved ${formattedDate}`} style={styles.date}>{formattedDate}</Text><Text style={styles.private}>This activity stays on your device by default.</Text></View>
        {(note || noteDraft.trim() || noteText) ? <View style={styles.privacyToggle}><View style={styles.privacyCopy}><Text style={styles.privacyTitle}>Private note preview</Text><Text style={styles.privacyBody}>{showNotePreviews ? "Visible on this detail page" : "Hidden on this detail page"}</Text></View><Switch accessibilityLabel="Show private note preview on activity detail" value={showNotePreviews} onValueChange={toggleNotePreviews} trackColor={{ false: "#EDE4E0", true: "#E96F61" }} /></View> : null}
        {id && !reversed && !recordUnavailable ? <View style={styles.noteCard}><Text style={styles.noteLabel}>PRIVATE NOTE</Text>{imageUri ? <View style={styles.noteAttachment}><Image source={{ uri: imageUri }} accessibilityLabel="Your private activity image" resizeMode="cover" style={styles.noteAttachmentImage} /><Pressable accessibilityRole="button" accessibilityLabel="Remove private activity image" onPress={() => { setImageUri(null); setSnackbar("Private image removed"); }} style={({ pressed }) => [styles.removeImage, pressed && styles.pressed]}><Text style={styles.removeImageText}>Remove image</Text></Pressable></View> : <Pressable accessibilityRole="button" accessibilityLabel="Add a private image to this activity" onPress={pickImage} style={({ pressed }) => [styles.addImage, pressed && styles.pressed]}><Text style={styles.addImageText}>Add a private image</Text><Text style={styles.addImageHint}>Optional · stays on this device</Text></Pressable>}<TextInput accessibilityLabel="Private activity note" value={noteDraft} onChangeText={setNoteDraft} placeholder="What do you want to remember?" placeholderTextColor="#9C8D99" multiline style={styles.noteInput} /><Pressable accessibilityRole="button" accessibilityLabel={hasPendingActivityChanges ? "Save private note" : "Private note saved"} accessibilityState={{ disabled: !hasPendingActivityChanges || savingNote, busy: savingNote }} disabled={!hasPendingActivityChanges || savingNote} onPress={() => { void saveNote(); }} style={({ pressed }) => [styles.noteButton, (!hasPendingActivityChanges || savingNote) && styles.noteButtonDisabled, pressed && styles.pressed]}><Text style={styles.noteButtonText}>{savingNote ? "Saving…" : hasPendingActivityChanges ? "Save note" : "Note saved"}</Text></Pressable></View> : null}
        {!reversed && id && !recordUnavailable ? <Pressable accessibilityRole="button" accessibilityLabel={`Remove ${title || detail.defaultTitle} from local activity`} accessibilityState={{ disabled: mutatingActivity }} disabled={mutatingActivity} onPress={confirmReverse} style={({ pressed }) => [styles.secondary, mutatingActivity && styles.noteButtonDisabled, pressed && styles.pressed]}><Text style={styles.secondaryText}>{mutatingActivity ? "Updating…" : "Remove from activity"}</Text></Pressable> : null}
        <Pressable accessibilityRole="button" accessibilityLabel={detail.action} onPress={returnToSource} style={({ pressed }) => [styles.primary, pressed && styles.pressed]}><Text style={styles.primaryText}>{detail.action}</Text></Pressable>
      </ScrollView>
      <Snackbar message={snackbar} actionLabel={reversed ? "Undo" : undefined} onAction={reversed ? undoReverse : undefined} onDismiss={() => setSnackbar(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 14 },
  recoveryCard: { backgroundColor: "#FFF7F2", borderColor: "#E5D8D4", borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 15 },
  recoveryTitle: { color: "#2B1D2F", fontSize: 17, lineHeight: 22, fontWeight: "700" },
  recoveryBody: { color: "#7E6F7D", fontSize: 12, lineHeight: 18, marginTop: 6 },
  recoveryButton: { alignSelf: "flex-start", backgroundColor: "#2B1D2F", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginTop: 13 },
  recoveryButtonText: { color: "#FFF7F2", fontSize: 12, fontWeight: "700" },
  noteAttachment: { marginTop: 11, borderRadius: 15, backgroundColor: "#FFFFFF", padding: 8 },
  noteAttachmentImage: { width: "100%", height: 110, borderRadius: 11 },
  removeImage: { alignItems: "center", paddingVertical: 7 },
  removeImageText: { color: "#B96861", fontSize: 12, fontWeight: "700" },
  addImage: { borderColor: "#D9CDE7", borderWidth: 1, borderRadius: 15, padding: 11, alignItems: "center", marginTop: 11 },
  addImageText: { color: "#5F4A5E", fontSize: 12, fontWeight: "700" },
  addImageHint: { color: "#9C8D99", fontSize: 11, marginTop: 3 },
  back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" },
  backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 },
  hero: { borderRadius: 26, padding: 22, marginTop: 22, minHeight: 250, justifyContent: "center", overflow: "hidden" },
  heroVisual: { width: "100%", height: 120, borderRadius: 20, marginBottom: 7 },
  heroLayers: { flexDirection: "row", gap: 7, marginBottom: 8 },
  heroLayer: { flex: 1, height: 34, borderRadius: 9 },
  label: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 },
  title: { color: "#2B1D2F", fontSize: 30, lineHeight: 36, fontWeight: "700", marginTop: 16 },
  body: { color: "#5F4A5E", fontSize: 15, lineHeight: 22, marginTop: 10 },
  meta: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 20, padding: 17, marginTop: 15 },
  metaLabel: { color: "#E96F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  date: { color: "#2B1D2F", fontSize: 17, fontWeight: "700", marginTop: 9 },
  private: { color: "#7E6F7D", fontSize: 12, lineHeight: 17, marginTop: 7 },
  privacyToggle: { backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 18, padding: 13, flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 15 },
  privacyCopy: { flex: 1, paddingRight: 12 },
  privacyTitle: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" },
  privacyBody: { color: "#7E6F7D", fontSize: 11, marginTop: 3 },
  noteCard: { backgroundColor: "#FFF7F2", borderColor: "#EDE4E0", borderWidth: 1, borderRadius: 20, padding: 16, marginTop: 15 },
  noteLabel: { color: "#E96F61", fontSize: 10, fontWeight: "800", letterSpacing: 1.3 },
  noteInput: { color: "#2B1D2F", fontSize: 14, lineHeight: 20, minHeight: 70, marginTop: 9, textAlignVertical: "top" },
  noteButton: { backgroundColor: "#F5D7CF", borderRadius: 13, alignItems: "center", paddingVertical: 11, marginTop: 10 },
  noteButtonDisabled: { opacity: 0.6 },
  noteButtonText: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" },
  pressed: { opacity: 0.84, transform: [{ scale: 0.985 }] },
  secondary: { borderColor: "#E5D8D4", borderWidth: 1, borderRadius: 18, padding: 15, alignItems: "center", marginTop: 16, marginBottom: 10 },
  secondaryText: { color: "#B96861", fontSize: 14, fontWeight: "700" },
  primary: { backgroundColor: "#2B1D2F", borderRadius: 18, padding: 17, alignItems: "center", marginBottom: 14 },
  primaryText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" },
});
