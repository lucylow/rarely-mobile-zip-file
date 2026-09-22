import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { ScreenContainer } from "@/components/screen-container";
import { ProductRecommendationCard } from "@/components/ProductRecommendationCard";
import { VisualArtifactCard } from "@/components/VisualArtifactCard";
import { useSponsorDemo } from "@/hooks/sponsors/use-sponsor-demo";
import { SPONSOR_CONFIG, SPONSOR_DISCLOSURE } from "@/lib/sponsors/config";
import { buildShoppingQuery, type PipelineStepId } from "@/lib/sponsors/orchestrator";
import type { StyleBrief } from "@/lib/sponsors/types";
import { xano } from "@/lib/sponsors/xano";
import { reportNonFatalError } from "@/lib/non-fatal-error";

const DEMO_KEY = "rarely.sponsor-demo.v3";
const DEFAULT_BRIEF: StyleBrief = {
  intent: "minimal everyday accessories",
  occasion: "everyday",
  vibe: "minimal",
  preferences: ["minimal", "neutral", "accessories"],
  budget: { min: 20, max: 120, currency: "USD" },
};
const STEP_COPY: Record<PipelineStepId, { number: string; sponsor: string; title: string }> = {
  personalize: { number: "01", sponsor: "RARELY + XANO", title: "Personalize" },
  visual: { number: "02", sponsor: "PERFECT CORP", title: "Visualize" },
  discover: { number: "03", sponsor: "SERPAPI", title: "Discover" },
  match: { number: "04", sponsor: "RARELY MATCH", title: "Explain" },
  remember: { number: "05", sponsor: "XANO", title: "Remember" },
  identity: { number: "06", sponsor: "NAME.COM", title: "Identity" },
  documents: { number: "07", sponsor: "NUTRIENT · FOXIT · DOCTAVIAN", title: "Structure" },
};
const STEP_IDS = Object.keys(STEP_COPY) as PipelineStepId[];
const DOMAINS = ["rarelycreate.example", "rarelystyle.example", "myrarely.example"];
const VISUALS = ["Quiet Forms", "Soft Contrast", "Everyday Edit"];

function Chip({ label, selected, onPress, accessibilityLabel }: { label: string; selected: boolean; onPress: () => void; accessibilityLabel: string }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ selected }} onPress={onPress} style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}><Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text></Pressable>;
}

export default function SponsorStudioScreen() {
  const [brief, setBrief] = useState(DEFAULT_BRIEF);
  const [category, setCategory] = useState("accessories");
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [lastDismissedId, setLastDismissedId] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [selectedVisual, setSelectedVisual] = useState(VISUALS[0]);
  const [hydrated, setHydrated] = useState(false);
  const demo = useSponsorDemo();

  useEffect(() => {
    let active = true;
    const loadDemoState = async () => {
      try {
        const raw = await AsyncStorage.getItem(DEMO_KEY);
        if (!active) return;
        if (!raw) {
          setHydrated(true);
          return;
        }
        try {
          const stored = JSON.parse(raw) as { savedIds?: string[]; dismissedIds?: string[]; selectedDomain?: string; selectedVisual?: string };
          if (Array.isArray(stored.savedIds)) setSavedIds(stored.savedIds.filter((id): id is string => typeof id === "string"));
          if (Array.isArray(stored.dismissedIds)) setDismissedIds(stored.dismissedIds.filter((id): id is string => typeof id === "string"));
          if (typeof stored.selectedDomain === "string") setSelectedDomain(stored.selectedDomain);
          if (typeof stored.selectedVisual === "string" && VISUALS.includes(stored.selectedVisual)) setSelectedVisual(stored.selectedVisual);
        } catch (error) {
          reportNonFatalError("sponsor:demo-persistence-parse", error);
        }
        setHydrated(true);
      } catch (error) {
        if (!active) return;
        reportNonFatalError("sponsor:demo-persistence-load", error);
        setHydrated(true);
      }
    };
    void loadDemoState();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(DEMO_KEY, JSON.stringify({ savedIds, dismissedIds, selectedDomain, selectedVisual })).catch((error) => {
      reportNonFatalError("sponsor:demo-persistence-save", error);
    });
  }, [hydrated, savedIds, dismissedIds, selectedDomain, selectedVisual]);

  const runBrief = useMemo(() => ({
    ...brief,
    intent: brief.intent.trim() || `${brief.vibe} ${brief.occasion} ${category}`,
    preferences: [brief.vibe, "neutral", category],
  }), [brief, category]);
  const query = useMemo(() => buildShoppingQuery(runBrief), [runBrief]);
  const visibleRankings = demo.result?.ranked.filter((ranking) => !dismissedIds.includes(ranking.productId)) ?? [];
  const isRunning = demo.status === "running";

  const resetDemo = () => {
    demo.reset();
    setSavedIds([]);
    setDismissedIds([]);
    setLastDismissedId(null);
    setSelectedDomain(null);
    setSelectedVisual(VISUALS[0]);
    void AsyncStorage.removeItem(DEMO_KEY).catch((error) => {
      reportNonFatalError("sponsor:demo-persistence-reset", error);
    });
  };
  const saveProduct = (id: string) => {
    if (savedIds.includes(id)) return;
    void xano.saveProduct("demo-user", id).then((profile) => setSavedIds(profile.savedProductIds)).catch((error) => {
      reportNonFatalError("sponsor:product-save", error, { productId: id });
    });
  };
  const dismissProduct = (id: string) => {
    setDismissedIds((current) => current.includes(id) ? current : [...current, id]);
    setLastDismissedId(id);
  };
  const undoDismiss = () => {
    if (!lastDismissedId) return;
    setDismissedIds((current) => current.filter((id) => id !== lastDismissedId));
    setLastDismissedId(null);
  };

  return <ScreenContainer edges={["top", "bottom", "left", "right"]}>
    <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>RARELY MIRROR · SPONSOR DEMO</Text>
        <Text style={styles.title}>Make a personal style story, not a judgment.</Text>
        <Text style={styles.subtitle}>A recordable, offline-first discovery flow built from your selected preferences.</Text>
        <View style={styles.disclosure}><Text style={styles.disclosureTitle}>OFFLINE · MOCK PROVIDERS</Text><Text style={styles.disclosureBody}>{SPONSOR_DISCLOSURE}</Text></View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionEyebrow}>01 · YOUR INTENT</Text>
        <Text style={styles.sectionTitle}>Create My Demo</Text>
        <TextInput accessibilityLabel="Describe your intent" value={brief.intent} onChangeText={(intent) => setBrief((current) => ({ ...current, intent }))} placeholder="What are you looking for?" style={styles.input} />
        <Text style={styles.fieldLabel}>STYLE</Text>
        <View style={styles.chipRow}>{(["minimal", "casual", "polished"] as const).map((vibe) => <Chip key={vibe} label={vibe} selected={brief.vibe === vibe} accessibilityLabel={`Choose ${vibe} style`} onPress={() => setBrief((current) => ({ ...current, vibe }))} />)}</View>
        <Text style={styles.fieldLabel}>OCCASION</Text>
        <View style={styles.chipRow}>{(["everyday", "creative", "evening"] as const).map((occasion) => <Chip key={occasion} label={occasion} selected={brief.occasion === occasion} accessibilityLabel={`Choose ${occasion} occasion`} onPress={() => setBrief((current) => ({ ...current, occasion }))} />)}</View>
        <Text style={styles.fieldLabel}>CATEGORY</Text>
        <View style={styles.chipRow}>{(["accessories", "bags", "shoes"] as const).map((item) => <Chip key={item} label={item} selected={category === item} accessibilityLabel={`Choose ${item} category`} onPress={() => setCategory(item)} />)}</View>
        <Text style={styles.query}>DEMO QUERY · {query}</Text>
      </View>

      <View style={styles.profileCard} accessibilityLabel="Your Rarely demo profile">
        <Text style={styles.profileKicker}>YOUR RARELY PROFILE · DEMO</Text>
        <View style={styles.profileGrid}><View><Text style={styles.profileLabel}>STYLE</Text><Text style={styles.profileValue}>{brief.vibe}</Text></View><View><Text style={styles.profileLabel}>OCCASION</Text><Text style={styles.profileValue}>{brief.occasion}</Text></View><View><Text style={styles.profileLabel}>CATEGORY</Text><Text style={styles.profileValue}>{category}</Text></View><View><Text style={styles.profileLabel}>BUDGET</Text><Text style={styles.profileValue}>mid</Text></View></View>
      </View>

      <View style={styles.controlPanel}>
        <View><Text style={styles.controlKicker}>DEMO RUN {demo.runNumber || "—"}</Text><Text style={styles.controlStatus}>{isRunning ? "Creating your RARELY result…" : demo.status === "complete" ? "Demo complete" : demo.status === "cancelled" ? "Demo cancelled" : "Ready when you are"}</Text></View>
        <View style={styles.controlButtons}>
          <Pressable accessibilityRole="button" accessibilityLabel={isRunning ? "Cancel active sponsor demo" : "Run full RARELY demo"} accessibilityState={{ disabled: false, busy: isRunning }} onPress={isRunning ? demo.cancel : () => void demo.run(runBrief)} style={({ pressed }) => [styles.primaryButton, isRunning && styles.cancelButton, pressed && styles.pressed]}><Text style={styles.primaryButtonText}>{isRunning ? "Cancel" : demo.status === "complete" ? "Run again" : "Run full demo"}</Text></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Reset sponsor demo" onPress={resetDemo} style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}><Text style={styles.secondaryButtonText}>Reset</Text></Pressable>
        </View>
      </View>

      <View style={styles.section} accessibilityLiveRegion="polite">
        <Text style={styles.sectionEyebrow}>02 · LIVE PIPELINE</Text>
        <Text style={styles.sectionTitle}>{isRunning ? "Providers are working" : demo.status === "complete" ? "Your demo is ready" : "One coherent workflow"}</Text>
        <View style={styles.timeline}>{STEP_IDS.map((id) => { const step = demo.stages[id]; const copy = STEP_COPY[id]; return <View key={id} style={[styles.timelineRow, step.status === "running" && styles.timelineActive]}><Text style={[styles.timelineNumber, step.status === "complete" && styles.timelineComplete]}>{step.status === "complete" ? "✓" : copy.number}</Text><View style={styles.timelineCopy}><Text style={styles.timelineSponsor}>{copy.sponsor}</Text><Text style={styles.timelineTitle}>{copy.title}</Text><Text style={styles.timelineMessage}>{step.message}{step.durationMs ? ` · ${step.durationMs}ms` : ""}</Text></View><Text style={styles.timelineState}>{step.status === "running" ? "●" : step.status === "complete" ? "READY" : ""}</Text></View>; })}</View>
        {demo.error ? <View accessibilityRole="alert" style={styles.errorCard}><Text style={styles.errorTitle}>Demo provider unavailable</Text><Text style={styles.errorText}>{demo.error} Your core RARELY space is still available.</Text><Pressable accessibilityRole="button" accessibilityLabel="Retry RARELY demo" onPress={() => void demo.run(runBrief)} style={styles.retryButton}><Text style={styles.retryText}>Retry demo</Text></Pressable></View> : null}
      </View>

      {demo.result ? <>
        <View style={styles.resultHeader}><Text style={styles.eyebrow}>03 · YOUR RARELY RESULT</Text><Text style={styles.resultTitle}>{brief.vibe} · {brief.occasion}</Text><Text style={styles.resultSummary}>{visibleRankings.length} recommendations · {demo.result.ranked[0]?.matchScore ?? 0}% top match · {demo.result.shopping.products.length} demo products searched</Text></View>
        <View style={styles.visualShell}><View style={styles.visualBadge}><Text style={styles.visualBadgeText}>PERFECT CORP · MOCK</Text></View><VisualArtifactCard artifact={{ ...demo.result.visual, title: `${selectedVisual} · ${brief.vibe} ${brief.occasion}` }} /><Text style={styles.visualCaption}>Selected concept: {selectedVisual}. Bundled demo visual; no live rendering request was made.</Text><View style={styles.chipRow}>{VISUALS.map((visual) => <Chip key={visual} label={visual} selected={selectedVisual === visual} accessibilityLabel={`Select ${visual} visual concept`} onPress={() => setSelectedVisual(visual)} />)}</View></View>

        <View style={styles.section}><View style={styles.resultSectionHeader}><View><Text style={styles.sectionEyebrow}>04 · DISCOVER + MATCH</Text><Text style={styles.sectionTitle}>Why these results</Text></View><Text style={styles.matchNote}>Compatibility only</Text></View><Text style={styles.supportingText}>RARELY Match uses your selected style, occasion, category, budget and saved signals—never appearance scoring.</Text>{lastDismissedId ? <Pressable accessibilityRole="button" accessibilityLabel="Undo latest product dismissal" onPress={undoDismiss} style={styles.undo}><Text style={styles.undoText}>Undo latest dismissal</Text></Pressable> : null}<ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>{visibleRankings.slice(0, 5).map((ranking) => { const product = demo.result?.shopping.products.find((item) => item.id === ranking.productId); return product ? <ProductRecommendationCard key={product.id} product={product} score={ranking.matchScore} reasons={ranking.reasons} saved={savedIds.includes(product.id)} onSave={() => saveProduct(product.id)} onDismiss={() => dismissProduct(product.id)} /> : null; })}</ScrollView>{savedIds.length ? <Text style={styles.syncStatus}>XANO DEMO SYNC · {savedIds.length} saved product signal{savedIds.length === 1 ? "" : "s"}</Text> : null}</View>

        <View style={styles.section}><Text style={styles.sectionEyebrow}>05 · IDENTITY + DOCUMENTS</Text><Text style={styles.sectionTitle}>Continue the story</Text><Text style={styles.supportingText}>These outputs are deterministic local previews. No registration, export, signature, or live provider call occurs.</Text><Text style={styles.fieldLabel}>SELECT A DEMO IDENTITY</Text><View style={styles.domainStack}>{DOMAINS.map((domain) => <Chip key={domain} label={domain} selected={selectedDomain === domain} accessibilityLabel={`Choose ${domain} demo identity`} onPress={() => setSelectedDomain(domain)} />)}</View>{selectedDomain ? <Text style={styles.identitySaved}>Identity selected · {selectedDomain} · DEMO AVAILABILITY ONLY</Text> : null}<View style={styles.artifactStack}><View style={styles.artifact}><Text style={styles.artifactProvider}>NUTRIENT · MOCK</Text><Text style={styles.artifactTitle}>My RARELY Style Book</Text><Text style={styles.artifactBody}>{demo.result.report.pages}-page local preview · Profile · Intent · Visual concept · Recommendations · Saved collection</Text></View><View style={styles.artifact}><Text style={styles.artifactProvider}>FOXIT · MOCK</Text><Text style={styles.artifactTitle}>PDF workflow complete — demo</Text><Text style={styles.artifactBody}>Review ready. A human approval remains explicit; no signature is performed.</Text></View><View style={styles.artifact}><Text style={styles.artifactProvider}>DOCTAVIAN · MOCK</Text><Text style={styles.artifactTitle}>Recommendation report</Text><Text style={styles.artifactBody}>Profile ✓ · Intent ✓ · Recommendations ✓ · Reasons ✓ · Metadata ✓</Text></View></View></View>
      </> : null}

      <View style={styles.providerStrip}><Text style={styles.providerStripTitle}>DEMO PROVIDER HEALTH</Text>{Object.values(SPONSOR_CONFIG).map((provider) => <View key={provider.id} style={styles.providerRow}><Text style={styles.providerName}>{provider.name}</Text><Text style={styles.providerRole}>{provider.role}</Text><Text style={styles.providerMode}>MOCK READY</Text></View>)}</View>
    </ScrollView>
  </ScreenContainer>;
}

const styles = StyleSheet.create({
  page: { padding: 20, gap: 18, paddingBottom: 80, backgroundColor: "#FBF8F3" },
  hero: { gap: 8, paddingTop: 4 },
  eyebrow: { color: "#E96F61", fontSize: 11, fontWeight: "900", letterSpacing: 1.6 },
  title: { color: "#2B1D2F", fontSize: 32, lineHeight: 38, fontWeight: "800", maxWidth: 330 },
  subtitle: { color: "#756E77", fontSize: 15, lineHeight: 22, maxWidth: 335 },
  disclosure: { padding: 14, borderRadius: 18, backgroundColor: "#2B1D2F", marginTop: 5, gap: 4 },
  disclosureTitle: { color: "#F8B6AB", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  disclosureBody: { color: "#F8F1E9", fontSize: 12, lineHeight: 18 },
  section: { gap: 10 },
  sectionEyebrow: { color: "#B96861", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  sectionTitle: { color: "#2B1D2F", fontSize: 22, lineHeight: 27, fontWeight: "800" },
  input: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E9DDD6", borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, color: "#2B1D2F", fontSize: 15 },
  fieldLabel: { color: "#776C75", fontSize: 10, fontWeight: "900", letterSpacing: 1.1, marginTop: 3 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { paddingHorizontal: 13, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: "#E8DCD7", backgroundColor: "#FFF" },
  chipSelected: { backgroundColor: "#2B1D2F", borderColor: "#2B1D2F" },
  chipText: { color: "#5C4E5C", fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  chipTextSelected: { color: "#FFF8F0" },
  pressed: { opacity: 0.78, transform: [{ scale: 0.985 }] },
  query: { color: "#A47972", fontSize: 10, lineHeight: 15, fontWeight: "700", letterSpacing: 0.4 },
  profileCard: { padding: 16, borderRadius: 20, backgroundColor: "#F4E9E2", borderWidth: 1, borderColor: "#E8D7D0", gap: 12 },
  profileKicker: { color: "#A75C55", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  profileGrid: { flexDirection: "row", flexWrap: "wrap", gap: 13 },
  profileLabel: { color: "#816C70", fontSize: 9, fontWeight: "900", letterSpacing: 0.9 },
  profileValue: { color: "#2B1D2F", fontSize: 14, fontWeight: "800", textTransform: "capitalize", marginTop: 3 },
  controlPanel: { padding: 16, borderRadius: 20, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E9DDD6", gap: 12 },
  controlKicker: { color: "#E96F61", fontSize: 10, fontWeight: "900", letterSpacing: 1.1 },
  controlStatus: { color: "#2B1D2F", fontSize: 18, lineHeight: 23, fontWeight: "800", marginTop: 3 },
  controlButtons: { flexDirection: "row", gap: 9 },
  primaryButton: { flex: 1, minHeight: 48, borderRadius: 14, backgroundColor: "#2B1D2F", alignItems: "center", justifyContent: "center", paddingHorizontal: 10 },
  cancelButton: { backgroundColor: "#B96861" },
  primaryButtonText: { color: "#FFF8F0", fontSize: 13, fontWeight: "900" },
  secondaryButton: { minHeight: 48, paddingHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: "#E2D6D0", alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: "#5C4E5C", fontSize: 13, fontWeight: "900" },
  timeline: { gap: 8 },
  timelineRow: { minHeight: 64, flexDirection: "row", alignItems: "center", gap: 11, padding: 11, borderRadius: 16, backgroundColor: "#FFF", borderWidth: 1, borderColor: "#EFE4DE" },
  timelineActive: { borderColor: "#E96F61", backgroundColor: "#FFF4F0" },
  timelineNumber: { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F2ECE7", color: "#827681", fontSize: 10, fontWeight: "900", textAlign: "center", textAlignVertical: "center", paddingTop: 8 },
  timelineComplete: { backgroundColor: "#DCF0E3", color: "#25724A" },
  timelineCopy: { flex: 1, gap: 1 },
  timelineSponsor: { color: "#A47972", fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
  timelineTitle: { color: "#2B1D2F", fontSize: 14, fontWeight: "800" },
  timelineMessage: { color: "#7C727A", fontSize: 10, lineHeight: 14 },
  timelineState: { color: "#E96F61", fontSize: 10, fontWeight: "900" },
  errorCard: { padding: 14, borderRadius: 16, backgroundColor: "#FCE8E6", gap: 4 },
  errorTitle: { color: "#8E3030", fontWeight: "900" },
  errorText: { color: "#8E3030", fontSize: 12, lineHeight: 18 },
  retryButton: { alignSelf: "flex-start", paddingVertical: 9, paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#8E3030", marginTop: 5 },
  retryText: { color: "#FFF", fontSize: 12, fontWeight: "900" },
  resultHeader: { gap: 5, paddingTop: 6 },
  resultTitle: { color: "#2B1D2F", fontSize: 26, lineHeight: 31, fontWeight: "800", textTransform: "capitalize" },
  resultSummary: { color: "#766C76", fontSize: 13, lineHeight: 19 },
  visualShell: { gap: 9 },
  visualBadge: { alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999, backgroundColor: "#2B1D2F" },
  visualBadgeText: { color: "#F8B6AB", fontSize: 9, fontWeight: "900", letterSpacing: 0.9 },
  visualCaption: { color: "#766C76", fontSize: 12, lineHeight: 18 },
  resultSectionHeader: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  matchNote: { color: "#A47972", fontSize: 10, fontWeight: "800", marginTop: 14 },
  supportingText: { color: "#746A73", fontSize: 13, lineHeight: 19 },
  undo: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, backgroundColor: "#EDE1D8" },
  undoText: { color: "#6B4B4A", fontSize: 12, fontWeight: "900" },
  productRow: { paddingRight: 20, paddingVertical: 2 },
  syncStatus: { color: "#25724A", fontSize: 11, fontWeight: "900", letterSpacing: 0.4 },
  domainStack: { gap: 8 },
  identitySaved: { color: "#25724A", fontSize: 11, lineHeight: 16, fontWeight: "800" },
  artifactStack: { gap: 9, marginTop: 4 },
  artifact: { padding: 15, borderRadius: 17, borderWidth: 1, borderColor: "#E7DCD4", backgroundColor: "#FFF" },
  artifactProvider: { color: "#A47972", fontSize: 9, fontWeight: "900", letterSpacing: 1 },
  artifactTitle: { color: "#2B1D2F", fontSize: 16, fontWeight: "800", marginTop: 5 },
  artifactBody: { color: "#756D74", fontSize: 12, lineHeight: 18, marginTop: 4 },
  providerStrip: { padding: 15, borderRadius: 20, backgroundColor: "#F1ECE6", gap: 9 },
  providerStripTitle: { color: "#7A5B53", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
  providerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  providerName: { color: "#2B1D2F", fontSize: 12, fontWeight: "800", width: 82 },
  providerRole: { color: "#766C76", fontSize: 10, flex: 1 },
  providerMode: { color: "#25724A", fontSize: 9, fontWeight: "900" },
});
