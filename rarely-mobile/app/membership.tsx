import { useCallback, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { getApiErrorMessage } from "@/lib/_core/api-errors";
import { ScreenContainer } from "@/components/screen-container";
import {
  activatePlan,
  getDefaultMonetizationState,
  getMembershipLabel,
  isPremiumActive,
  loadMonetizationExperimentState,
  loadMonetizationState,
  orderPlansForVariant,
  type PaywallVariant,
  type MonetizationState,
  PLAN_DEFINITIONS,
  recordPaywallConversion,
  recordPaywallImpression,
  restoreMembership,
  startTrial,
  trialDaysLeft,
  type PlanId,
} from "@/lib/ux/monetization";
import { Snackbar } from "@/components/ui/snackbar";
import { useAsyncFocusEffect } from "@/hooks/use-async-focus-effect";
import { triggerLightImpact } from "@/lib/ux/haptics";

const premiumFeatures = [
  "Priority access to new Create and Studio tools",
  "Expanded private journal exports and highlights",
  "Member-only community circles and rituals",
];

const sourceMessage: Record<string, string> = {
  create_header: "Unlock advanced Create tools tailored to your current flow.",
  create_tool_photo: "Photo prompts are part of Rarely Plus.",
  create_tool_music: "Music mood packs are part of Rarely Plus.",
  create_tool_collage: "Collage tools are part of Rarely Plus.",
  create_tool_ai: "Rare AI is part of Rarely Plus.",
  community_header: "Get access to featured circles curated for your interests.",
  studio_header: "Get access to featured routines and premium guided rituals.",
  profile: "Upgrade to keep your reflections growing with deeper insights.",
  home_usage: "You are consistently showing up. Plus helps you go deeper.",
};

export default function MembershipScreen() {
  const [state, setState] = useState<MonetizationState>(() => getDefaultMonetizationState());
  const [variant, setVariant] = useState<PaywallVariant>("value-first");
  const [processingPlanId, setProcessingPlanId] = useState<PlanId | "trial" | "restore" | null>(null);
  const [snackbar, setSnackbar] = useState<string | null>(null);
  const params = useLocalSearchParams<{ source?: string }>();
  const source = typeof params.source === "string" ? params.source : undefined;

  useAsyncFocusEffect(async (isActive) => {
    try {
      const [monetizationState, experimentState] = await Promise.all([
        loadMonetizationState(AsyncStorage),
        loadMonetizationExperimentState(AsyncStorage),
      ]);
      if (!isActive()) return;
      setState(monetizationState);
      setVariant(experimentState.variant);
      try {
        await recordPaywallImpression(AsyncStorage, source ?? "membership");
      } catch {
        // Non-blocking analytics failure.
      }
    } catch {
      if (isActive()) setSnackbar("Could not load membership details");
    }
  }, [source]);

  const premiumActive = isPremiumActive(state);
  const daysLeft = trialDaysLeft(state);
  const orderedPlans = useMemo(() => orderPlansForVariant(PLAN_DEFINITIONS, variant), [variant]);
  const sourceContext = source
    ? sourceMessage[source] ??
      (source.startsWith("community_circle_")
        ? "This featured community circle is part of Rarely Plus."
        : source.startsWith("studio_routine_")
          ? "This featured studio routine is part of Rarely Plus."
          : undefined)
    : undefined;
  const statusCopy = useMemo(() => {
    if (state.status === "trial") return `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your trial`;
    if (premiumActive) return "You have full Rarely Plus access";
    return variant === "value-first" ? "Most people choose annual to save more." : "Start flexible, then upgrade as your rhythm grows.";
  }, [daysLeft, premiumActive, state.status, variant]);

  const trackConversion = useCallback(
    (type: "trial" | "purchase" | "restore") => {
      void recordPaywallConversion(AsyncStorage, type, source ?? "membership").catch(() => {
        // Conversion tracking is best-effort.
      });
    },
    [source],
  );

  const runMembershipAction = useCallback(
    async (
      actionId: PlanId | "trial" | "restore",
      action: () => Promise<void>,
      fallbackMessage: string,
    ) => {
      setProcessingPlanId(actionId);
      try {
        await action();
      } catch (error) {
        setSnackbar(getApiErrorMessage(error, fallbackMessage));
      } finally {
        setProcessingPlanId(null);
      }
    },
    [],
  );

  const subscribe = useCallback(
    async (planId: PlanId) =>
      runMembershipAction(
        planId,
        async () => {
          await triggerLightImpact();
          const next = await activatePlan(AsyncStorage, planId, source ?? "membership");
          setState(next);
          setSnackbar(`Rarely Plus unlocked with ${planId}.`);
          trackConversion("purchase");
        },
        "Could not complete purchase right now",
      ),
    [runMembershipAction, source, trackConversion],
  );

  const beginTrial = useCallback(
    async () =>
      runMembershipAction(
        "trial",
        async () => {
          await triggerLightImpact();
          const next = await startTrial(AsyncStorage, source ?? "membership");
          setState(next);
          const trialLeft = trialDaysLeft(next);
          setSnackbar(`Trial started. ${trialLeft} day${trialLeft === 1 ? "" : "s"} free.`);
          trackConversion("trial");
        },
        "Could not start trial right now",
      ),
    [runMembershipAction, source, trackConversion],
  );

  const restore = useCallback(
    async () =>
      runMembershipAction(
        "restore",
        async () => {
          const next = await restoreMembership(AsyncStorage);
          setState(next);
          setSnackbar(next.status === "active" ? "Membership restored." : "No active purchases found.");
          trackConversion("restore");
        },
        "Could not restore purchases right now",
      ),
    [runMembershipAction, trackConversion],
  );

  return (
    <ScreenContainer className="px-5 pt-5">
      <FlatList
        data={orderedPlans}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <View style={styles.topRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => router.back()}
                style={({ pressed }) => [styles.backButtonTop, pressed && styles.pressed]}
              >
                <Text style={styles.backButtonTopText}>‹</Text>
              </Pressable>
            </View>
            <Text style={styles.eyebrow}>RARELY PLUS</Text>
            <Text style={styles.title}>Keep your rituals in motion.</Text>
            <Text style={styles.subtitle}>{statusCopy}</Text>
            {sourceContext ? (
              <View style={styles.contextCard}>
                <Text style={styles.contextText}>{sourceContext}</Text>
              </View>
            ) : null}
            <View style={styles.statusCard}>
              <Text style={styles.statusLabel}>Current plan</Text>
              <Text style={styles.statusValue}>{getMembershipLabel(state)}</Text>
            </View>
            {!premiumActive ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Start your seven day trial"
                onPress={beginTrial}
                style={({ pressed }) => [styles.trialButton, pressed && styles.pressed]}
                disabled={processingPlanId !== null}
              >
                <Text style={styles.trialButtonText}>
                  {processingPlanId === "trial" ? "Starting trial..." : "Start 7-day free trial"}
                </Text>
              </Pressable>
            ) : null}
            <View style={styles.features}>
              {premiumFeatures.map((feature) => (
                <Text key={feature} style={styles.featureItem}>
                  • {feature}
                </Text>
              ))}
            </View>
            <Text style={styles.section}>Choose your plan</Text>
          </View>
        }
        renderItem={({ item }) => {
          const selected = state.planId === item.id && premiumActive;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Choose ${item.name} plan`}
              onPress={() => subscribe(item.id)}
              style={({ pressed }) => [
                styles.planCard,
                selected && styles.planCardSelected,
                processingPlanId !== null && styles.planCardDisabled,
                pressed && styles.pressed,
              ]}
              disabled={processingPlanId !== null}
            >
              <View style={styles.planTop}>
                <Text style={styles.planName}>{item.name}</Text>
                {item.highlight ? <Text style={styles.highlight}>{item.highlight}</Text> : null}
              </View>
              <Text style={styles.planPrice}>
                {item.priceLabel} <Text style={styles.periodLabel}>{item.periodLabel}</Text>
              </Text>
              <Text style={styles.planDescription}>{item.description}</Text>
              <Text style={styles.planAction}>
                {processingPlanId === item.id ? "Processing..." : selected ? "Current plan" : "Choose plan"}
              </Text>
            </Pressable>
          );
        }}
        ListFooterComponent={
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Restore purchases"
              onPress={restore}
              style={({ pressed }) => [styles.restoreButton, pressed && styles.pressed]}
              disabled={processingPlanId !== null}
            >
              <Text style={styles.restoreText}>{processingPlanId === "restore" ? "Restoring..." : "Restore purchases"}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Text style={styles.backText}>Not now</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View local monetization insights"
              onPress={() => router.push("/monetization-insights" as never)}
              style={({ pressed }) => [styles.insightsButton, pressed && styles.pressed]}
            >
              <Text style={styles.insightsText}>View monetization insights</Text>
            </Pressable>
            <Text style={styles.note}>
              Demo pricing for product validation. Replace with App Store or Play billing when purchase APIs are wired.
            </Text>
          </View>
        }
      />
      <Snackbar message={snackbar} onDismiss={() => setSnackbar(null)} bottomOffset={72} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 28, gap: 12 },
  topRow: { marginBottom: 10 },
  backButtonTop: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FFFFFF", borderColor: "#EDE4E0", borderWidth: 1, alignItems: "center", justifyContent: "center" },
  backButtonTopText: { color: "#2B1D2F", fontSize: 32, lineHeight: 34, marginTop: -4 },
  eyebrow: { color: "#E96F61", fontSize: 12, fontWeight: "800", letterSpacing: 2.2 },
  title: { color: "#2B1D2F", fontSize: 32, lineHeight: 36, fontWeight: "700", marginTop: 10, maxWidth: 330 },
  subtitle: { color: "#7E6F7D", fontSize: 15, lineHeight: 20, marginTop: 8 },
  contextCard: { backgroundColor: "#FFF4E8", borderColor: "#F1D5C3", borderWidth: 1, borderRadius: 14, padding: 10, marginTop: 10 },
  contextText: { color: "#5F4A5E", fontSize: 12, lineHeight: 17, fontWeight: "600" },
  statusCard: { borderRadius: 18, borderColor: "#EDE4E0", borderWidth: 1, backgroundColor: "#FFFFFF", padding: 14, marginTop: 14 },
  statusLabel: { color: "#9C8D99", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  statusValue: { color: "#2B1D2F", fontSize: 16, fontWeight: "700", marginTop: 5 },
  trialButton: { borderRadius: 15, backgroundColor: "#2B1D2F", paddingVertical: 13, alignItems: "center", marginTop: 12 },
  trialButtonText: { color: "#FFF7F2", fontSize: 14, fontWeight: "700" },
  features: { backgroundColor: "#FFF4E8", borderColor: "#F1D5C3", borderWidth: 1, borderRadius: 18, padding: 14, marginTop: 12, gap: 4 },
  featureItem: { color: "#5F4A5E", fontSize: 13, lineHeight: 19 },
  section: { color: "#2B1D2F", fontSize: 18, fontWeight: "700", marginTop: 20, marginBottom: 4 },
  planCard: { borderRadius: 20, borderColor: "#EDE4E0", borderWidth: 1, backgroundColor: "#FFFFFF", padding: 16 },
  planCardSelected: { borderColor: "#2B1D2F", borderWidth: 2 },
  planCardDisabled: { opacity: 0.6 },
  planTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planName: { color: "#2B1D2F", fontSize: 18, fontWeight: "700" },
  highlight: { color: "#B96861", fontSize: 10, fontWeight: "800", letterSpacing: 1.1, textTransform: "uppercase" },
  planPrice: { color: "#2B1D2F", fontSize: 24, fontWeight: "700", marginTop: 7 },
  periodLabel: { color: "#7E6F7D", fontSize: 13, fontWeight: "600" },
  planDescription: { color: "#5F4A5E", fontSize: 13, lineHeight: 19, marginTop: 5 },
  planAction: { color: "#2B1D2F", fontSize: 12, fontWeight: "700", marginTop: 10 },
  footer: { marginTop: 16, alignItems: "center" },
  restoreButton: { paddingVertical: 10, paddingHorizontal: 8 },
  restoreText: { color: "#5F4A5E", fontSize: 13, fontWeight: "700" },
  backButton: { borderRadius: 15, borderColor: "#EDE4E0", borderWidth: 1, paddingVertical: 12, paddingHorizontal: 20, marginTop: 6 },
  backText: { color: "#2B1D2F", fontSize: 13, fontWeight: "700" },
  insightsButton: { borderRadius: 14, borderColor: "#D9CDE7", borderWidth: 1, paddingVertical: 10, paddingHorizontal: 16, marginTop: 8 },
  insightsText: { color: "#5F4A5E", fontSize: 12, fontWeight: "700" },
  note: { color: "#9C8D99", fontSize: 11, lineHeight: 16, textAlign: "center", marginTop: 14, paddingHorizontal: 14 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.986 }] },
});
