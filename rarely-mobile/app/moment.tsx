import { useEffect, useMemo, useRef, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScreenContainer } from "@/components/screen-container";
import { normalizedParam, runGuarded } from "@/lib/ux/guards";
import { parseActivityRecords } from "@/lib/ux/localStorage";
import { Snackbar } from "@/components/ui/snackbar";
import { triggerSuccessNotification } from "@/lib/ux/haptics";

const momentSlides: Record<string, { uri: string; label: string }[]> = {
  happy: [{ uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png", label: "Warm color" }, { uri: "/manus-storage/rarely-profile-reflection_7bbb06d5.png", label: "Soft reflection" }, { uri: "/manus-storage/rarely-card-movement_ff8eddc9.png", label: "Joyful movement" }],
  stressed: [{ uri: "/manus-storage/rarely-preferences-privacy_68d368dc.png", label: "Protective calm" }, { uri: "/manus-storage/rarely-studio-focus_85abd483.png", label: "Quiet focus" }, { uri: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png", label: "Gentle reflection" }],
  creative: [{ uri: "/manus-storage/rarely-card-movement_ff8eddc9.png", label: "Playful movement" }, { uri: "/manus-storage/rarely-studio-making_74b6fbec.png", label: "Making energy" }, { uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png", label: "Color discovery" }],
  tired: [{ uri: "/manus-storage/rarely-studio-focus_85abd483.png", label: "Gentle focus" }, { uri: "/manus-storage/rarely-preferences-care_6b1ad02a.png", label: "Personal care" }, { uri: "/manus-storage/rarely-scrapbook-reflection_b501e3ae.png", label: "Soft pause" }],
  excited: [{ uri: "/manus-storage/rarely-studio-making_74b6fbec.png", label: "Creative spark" }, { uri: "/manus-storage/rarely-card-movement_ff8eddc9.png", label: "Forward motion" }, { uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png", label: "Bright color" }],
  vibing: [{ uri: "/manus-storage/rarely-profile-reflection_7bbb06d5.png", label: "Reflective ease" }, { uri: "/manus-storage/rarely-scrapbook-color_bbc09103.png", label: "Ambient color" }, { uri: "/manus-storage/rarely-card-movement_ff8eddc9.png", label: "Easy movement" }],
};

const moments: Record<string, { title: string; body: string; steps: string[]; color: string }> = {
  happy: { title: "Keep the glow going", body: "A tiny celebration for the good energy you already have.", steps: ["Save one thing that made you smile", "Make a 30-second joy playlist", "Share a kind note with yourself"], color: "#F8E3A8" },
  stressed: { title: "A softer place to land", body: "Slow down with a gentle reset that asks nothing from you.", steps: ["Take three unhurried breaths", "Write what can wait until tomorrow", "Choose one comforting sound"], color: "#D9CDE7" },
  creative: { title: "Make a little magic", body: "Follow your curiosity for ten minutes and see where it leads.", steps: ["Write a line that starts with ‘I wonder…’", "Take a photo of an interesting color", "Save one idea for later"], color: "#F5D7CF" },
  tired: { title: "Gentle is enough", body: "A low-energy moment for checking in without fixing anything.", steps: ["Name one thing your body needs", "Put your phone down for one minute", "Write one kind sentence to yourself"], color: "#D8E1D5" },
  excited: { title: "Channel the spark", body: "Turn your momentum into one small, satisfying creative action.", steps: ["Choose a tiny idea to start", "Set a ten-minute timer", "Capture what you made"], color: "#F6C7B7" },
  vibing: { title: "Follow the feeling", body: "No agenda. Just a playful pause that belongs entirely to you.", steps: ["Pick a song by its first impression", "Notice three colors around you", "Save a moment worth remembering"], color: "#E7D9C6" },
};

export default function MomentScreen() {
  const { mood } = useLocalSearchParams<{ mood?: string | string[] }>();
  const moodKey = normalizedParam(mood);
  const resolvedMood = moodKey && moments[moodKey] ? moodKey : "creative";
  const moment = useMemo(() => moments[resolvedMood] ?? moments.creative, [resolvedMood]);
  const [completed, setCompleted] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const slideScrollRef = useRef<ScrollView>(null);
  const slides = momentSlides[resolvedMood] ?? momentSlides.creative;
  const momentId = resolvedMood;
  const { width: viewportWidth } = useWindowDimensions();
  const slideWidth = Math.max(220, viewportWidth - 88);
  const clampedSlideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));

  useEffect(() => {
    let active = true;
    void runGuarded(
      () => AsyncStorage.getItem("rarely.completedMoments"),
      () => {
        if (!active) return;
        setSnackbar("Could not load saved moment status");
      },
    ).then((value) => {
      if (!active || value === undefined) return;
      setCompleted(parseActivityRecords(value).some((item) => item.id === momentId));
    });
    return () => {
      active = false;
    };
  }, [momentId]);

  useEffect(() => {
    setSlideIndex(0);
    slideScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [momentId, slideWidth]);

  const finish = async () => {
    if (submitting) return;
    setSubmitting(true);
    const saved = await runGuarded(async () => {
      const key = "rarely.completedMoments";
      const current = parseActivityRecords(await AsyncStorage.getItem(key));
      const next = [...current.filter((item) => item.id !== momentId), { id: momentId, name: moment.title, completedAt: new Date().toISOString() }];
      await AsyncStorage.setItem(key, JSON.stringify(next));
    }, () => setSnackbar("Could not save this moment right now"));
    if (saved === undefined) {
      setSubmitting(false);
      return;
    }
    setCompleted(true);
    await triggerSuccessNotification();
    setSnackbar("Rare Moment saved");
    setSubmitting(false);
  };

  return (
    <ScreenContainer edges={["top", "bottom", "left", "right"]} className="px-5 pt-3">
      <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Text style={styles.backText}>‹</Text></Pressable><Text style={styles.headerLabel}>RARE MOMENT</Text><View style={styles.spacer} /></View>
      <View style={[styles.hero, { backgroundColor: moment.color }]}><ScrollView ref={slideScrollRef} horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(event) => setSlideIndex(Math.max(0, Math.min(Math.round(event.nativeEvent.contentOffset.x / slideWidth), slides.length - 1)))} style={styles.heroScroller}>{slides.map((slide) => <View key={slide.uri} style={[styles.heroSlide, { width: slideWidth }]}><Image source={{ uri: slide.uri }} resizeMode="cover" accessibilityLabel={`${slide.label} for ${resolvedMood} mood`} style={styles.heroVisual} /></View>)}</ScrollView><Text accessibilityLiveRegion="polite" style={styles.slideCount}>Visual {clampedSlideIndex + 1} of {slides.length} · {slides[clampedSlideIndex]?.label}</Text><Text style={styles.heroIcon}>✦</Text><Text style={styles.kicker}>10 MINUTES FOR YOU</Text><Text style={styles.title}>{moment.title}</Text><Text style={styles.body}>{moment.body}</Text>{completed ? <Text style={styles.completedMeta}>Saved as a Rare Moment today</Text> : null}</View>
      <View style={styles.slideNav}><Pressable accessibilityRole="button" accessibilityLabel="Previous mood visual" accessibilityState={{ disabled: clampedSlideIndex === 0 }} disabled={clampedSlideIndex === 0} onPress={() => { const next = clampedSlideIndex - 1; setSlideIndex(next); slideScrollRef.current?.scrollTo({ x: next * slideWidth, animated: true }); }} style={[styles.slideButton, clampedSlideIndex === 0 && styles.slideDisabled]}><Text style={styles.slideButtonText}>‹</Text></Pressable><Pressable accessibilityRole="button" accessibilityLabel="Next mood visual" accessibilityState={{ disabled: clampedSlideIndex === slides.length - 1 }} disabled={clampedSlideIndex === slides.length - 1} onPress={() => { const next = clampedSlideIndex + 1; setSlideIndex(next); slideScrollRef.current?.scrollTo({ x: next * slideWidth, animated: true }); }} style={[styles.slideButton, clampedSlideIndex === slides.length - 1 && styles.slideDisabled]}><Text style={styles.slideButtonText}>›</Text></Pressable></View><Text style={styles.section}>A gentle path</Text>
      <View style={styles.steps}>{moment.steps.map((step, index) => <View key={step} style={styles.step}><View style={[styles.stepDot, index === 0 && styles.activeDot]}><Text style={styles.stepNumber}>{index + 1}</Text></View><Text style={styles.stepText}>{step}</Text></View>)}</View>
      <View style={styles.bottom}><Text style={styles.note}>You can pause, skip, or come back anytime.</Text><Pressable accessibilityState={{ disabled: submitting, busy: submitting }} disabled={submitting} onPress={finish} style={({ pressed }) => [styles.button, completed && styles.completed, submitting && styles.buttonDisabled, pressed && styles.pressed]}><Text style={styles.buttonText}>{submitting ? "Saving…" : completed ? "Moment saved ✓" : "Mark as complete"}</Text></Pressable><Pressable onPress={() => router.replace("/(tabs)")} style={styles.homeButton}><Text style={styles.homeText}>Return to Home</Text></Pressable></View>
      <Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({ header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, back: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, backText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 }, headerLabel: { color: "#E96F61", fontSize: 11, fontWeight: "800", letterSpacing: 2 }, spacer: { width: 42 }, hero: { borderRadius: 30, padding: 24, minHeight: 270, justifyContent: "center", overflow: "hidden" }, heroScroller: { width: "100%" }, heroSlide: {}, heroVisual: { width: "100%", height: 128, borderRadius: 19, marginBottom: 5 }, slideCount: { color: "#7E6F7D", fontSize: 11, fontWeight: "700", marginTop: 2 }, slideNav: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 10 }, slideButton: { width: 34, height: 30, borderRadius: 15, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, slideDisabled: { opacity: 0.35 }, slideButtonText: { color: "#2B1D2F", fontSize: 18, fontWeight: "700" }, heroIcon: { color: "#2B1D2F", fontSize: 30 }, kicker: { color: "#7E6F7D", fontSize: 10, fontWeight: "800", letterSpacing: 1.4, marginTop: 18 }, title: { color: "#2B1D2F", fontSize: 30, lineHeight: 35, fontWeight: "700", marginTop: 12 }, body: { color: "#5F4A5E", fontSize: 15, lineHeight: 22, marginTop: 8 }, completedMeta: { color: "#66816D", fontSize: 11, fontWeight: "700", marginTop: 14 }, section: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 28, marginBottom: 14 }, steps: { gap: 12 }, step: { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 7 }, stepDot: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#EDE4E0", alignItems: "center", justifyContent: "center" }, activeDot: { backgroundColor: "#2B1D2F" }, stepNumber: { color: "#7E6F7D", fontSize: 12, fontWeight: "700" }, stepText: { color: "#2B1D2F", fontSize: 15, flex: 1 }, bottom: { marginTop: "auto", paddingBottom: 8 }, note: { color: "#9C8D99", textAlign: "center", fontSize: 12, marginBottom: 13 }, button: { backgroundColor: "#2B1D2F", borderRadius: 18, paddingVertical: 16, alignItems: "center" }, buttonDisabled: { opacity: 0.7 }, completed: { backgroundColor: "#66816D" }, pressed: { opacity: 0.85, transform: [{ scale: 0.985 }] }, buttonText: { color: "#FFF7F2", fontSize: 15, fontWeight: "700" }, homeButton: { alignItems: "center", paddingVertical: 15 }, homeText: { color: "#7E6F7D", fontSize: 14, fontWeight: "600" }, });
