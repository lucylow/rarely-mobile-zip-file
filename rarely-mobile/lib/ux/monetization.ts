export const MONETIZATION_STATE_KEY = "rarely.monetization.v1";
export const MONETIZATION_PROMPT_STATE_KEY = "rarely.monetization.prompt.v1";
export const MONETIZATION_EXPERIMENT_KEY = "rarely.monetization.experiment.v1";
const TRIAL_LENGTH_DAYS = 7;
const PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const MAX_PROMPT_IMPRESSIONS = 8;

export type PlanId = "monthly" | "annual" | "lifetime";
export type MembershipStatus = "free" | "trial" | "active";

export type RevenueStreamId = "free_utility" | "membership" | "ai_usage" | "creator_tools" | "commerce" | "partner";

export type RevenueStreamDefinition = {
  id: RevenueStreamId;
  label: string;
  description: string;
  enabledByDefault: boolean;
  contributionMarginPercent: number | null;
};

export const REVENUE_CATALOG: readonly RevenueStreamDefinition[] = [
  { id: "free_utility", label: "Free utility", description: "Core reflection and creative discovery remain available without payment.", enabledByDefault: true, contributionMarginPercent: null },
  { id: "membership", label: "Rarely Plus", description: "Optional membership for clearly described premium rituals and tools.", enabledByDefault: true, contributionMarginPercent: null },
  { id: "ai_usage", label: "Rare AI usage", description: "AI-assisted creativity is tracked separately from membership conversion.", enabledByDefault: false, contributionMarginPercent: null },
  { id: "creator_tools", label: "Creator tools", description: "Optional tools for making and exporting creative work.", enabledByDefault: false, contributionMarginPercent: null },
  { id: "commerce", label: "Physical goods", description: "Future compliant commerce kept separate from digital entitlements.", enabledByDefault: false, contributionMarginPercent: null },
  { id: "partner", label: "Partner revenue", description: "Future carefully selected partners with transparent disclosures.", enabledByDefault: false, contributionMarginPercent: null },
] as const;

export function getEnabledRevenueStreams(catalog: readonly RevenueStreamDefinition[] = REVENUE_CATALOG): RevenueStreamDefinition[] {
  return catalog.filter((stream) => stream.enabledByDefault).map((stream) => ({ ...stream }));
}

export function getRevenueStream(streamId: RevenueStreamId): RevenueStreamDefinition {
  return { ...(REVENUE_CATALOG.find((stream) => stream.id === streamId) ?? REVENUE_CATALOG[0]) };
}

export type PlanDefinition = {
  id: PlanId;
  name: string;
  priceLabel: string;
  periodLabel: string;
  description: string;
  highlight?: string;
};

export type MonetizationState = {
  status: MembershipStatus;
  planId?: PlanId;
  trialEndsAt?: string;
  startedAt?: string;
  source?: string;
};

export type MonetizationPromptState = {
  shownCount: number;
  lastShownAt?: string;
  lastSource?: string;
};

export type UsageSnapshot = {
  journalCount: number;
  momentCount: number;
  circleCount: number;
  routineCount: number;
};

export type PaywallVariant = "value-first" | "flex-first";
export type PaywallConversionType = "trial" | "purchase" | "restore";
export type PaywallSourceMetrics = {
  impressions: number;
  trialStarts: number;
  planPurchases: number;
  restores: number;
};

export type RankedPaywallSource = {
  source: string;
  metrics: PaywallSourceMetrics;
  conversionRate: number;
};

export type MonetizationExperimentState = {
  variant: PaywallVariant;
  assignedAt: string;
  impressions: number;
  trialStarts: number;
  planPurchases: number;
  restores: number;
  lastSource?: string;
  lastActionAt?: string;
  sourceMetrics?: Record<string, PaywallSourceMetrics>;
};

type StorageLike = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: "monthly",
    name: "Monthly",
    priceLabel: "$7.99",
    periodLabel: "/ month",
    description: "Flexible support for your creative rhythm.",
  },
  {
    id: "annual",
    name: "Annual",
    priceLabel: "$59.99",
    periodLabel: "/ year",
    description: "Best value for year-round reflection and rituals.",
    highlight: "Most loved",
  },
  {
    id: "lifetime",
    name: "Lifetime",
    priceLabel: "$119",
    periodLabel: "one-time",
    description: "Keep Rarely forever with a single payment.",
  },
];

function isPlanId(value: unknown): value is PlanId {
  return value === "monthly" || value === "annual" || value === "lifetime";
}

function isMembershipStatus(value: unknown): value is MembershipStatus {
  return value === "free" || value === "trial" || value === "active";
}

function isValidDateString(value: string): boolean {
  return Number.isFinite(new Date(value).getTime());
}

function isPaywallVariant(value: unknown): value is PaywallVariant {
  return value === "value-first" || value === "flex-first";
}

function isMonetizationState(value: unknown): value is MonetizationState {
  if (!value || typeof value !== "object") return false;
  const maybe = value as MonetizationState;
  if (!isMembershipStatus(maybe.status)) return false;
  if (maybe.planId !== undefined && !isPlanId(maybe.planId)) return false;
  if (maybe.trialEndsAt !== undefined && (typeof maybe.trialEndsAt !== "string" || !isValidDateString(maybe.trialEndsAt))) return false;
  if (maybe.startedAt !== undefined && (typeof maybe.startedAt !== "string" || !isValidDateString(maybe.startedAt))) return false;
  if (maybe.source !== undefined && typeof maybe.source !== "string") return false;
  if (maybe.status === "free" && (maybe.planId !== undefined || maybe.trialEndsAt !== undefined)) return false;
  if (maybe.status === "trial" && !maybe.planId) return false;
  if (maybe.status === "active" && !maybe.planId) return false;
  if (maybe.status !== "trial" && maybe.trialEndsAt !== undefined) return false;
  return true;
}

function normalizeMonetizationState(state: MonetizationState, now = Date.now()): MonetizationState {
  if (state.status !== "trial") {
    return state;
  }

  if (!state.trialEndsAt) {
    return getDefaultMonetizationState();
  }

  const trialEndsAt = new Date(state.trialEndsAt).getTime();
  if (!Number.isFinite(trialEndsAt) || trialEndsAt <= now) {
    return getDefaultMonetizationState();
  }

  return state;
}

function didNormalizeMonetizationState(from: MonetizationState, to: MonetizationState): boolean {
  return (
    from.status !== to.status ||
    from.planId !== to.planId ||
    from.trialEndsAt !== to.trialEndsAt ||
    from.startedAt !== to.startedAt ||
    from.source !== to.source
  );
}

async function persistNormalizedMonetizationState(storage: StorageLike, state: MonetizationState) {
  try {
    await saveMonetizationState(storage, state);
  } catch {
    // Best effort only. Loading should still succeed even if persistence fails.
  }
}

function isMonetizationPromptState(value: unknown): value is MonetizationPromptState {
  if (!value || typeof value !== "object") return false;
  const maybe = value as MonetizationPromptState;
  if (typeof maybe.shownCount !== "number") return false;
  if (maybe.lastShownAt !== undefined && typeof maybe.lastShownAt !== "string") return false;
  if (maybe.lastSource !== undefined && typeof maybe.lastSource !== "string") return false;
  return true;
}

function normalizePromptState(state: MonetizationPromptState): MonetizationPromptState {
  const shownCount = Number.isFinite(state.shownCount) ? Math.max(0, Math.floor(state.shownCount)) : 0;
  const lastShownAt =
    state.lastShownAt && Number.isFinite(new Date(state.lastShownAt).getTime())
      ? state.lastShownAt
      : undefined;
  const lastSource = typeof state.lastSource === "string" && state.lastSource.trim() ? state.lastSource : undefined;
  return {
    shownCount,
    lastShownAt,
    lastSource,
  };
}

async function persistPromptStateBestEffort(storage: StorageLike, state: MonetizationPromptState): Promise<void> {
  try {
    await saveMonetizationPromptState(storage, state);
  } catch {
    // Keep valid prompt state available even when normalization cannot be persisted.
  }
}

function didNormalizePromptState(
  from: MonetizationPromptState,
  to: MonetizationPromptState,
): boolean {
  return (
    from.shownCount !== to.shownCount ||
    from.lastShownAt !== to.lastShownAt ||
    from.lastSource !== to.lastSource
  );
}

function isMonetizationExperimentState(value: unknown): value is MonetizationExperimentState {
  if (!value || typeof value !== "object") return false;
  const maybe = value as MonetizationExperimentState;
  if (!isPaywallVariant(maybe.variant)) return false;
  if (typeof maybe.assignedAt !== "string" || !isValidDateString(maybe.assignedAt)) return false;
  const counters = [maybe.impressions, maybe.trialStarts, maybe.planPurchases, maybe.restores];
  if (counters.some((counter) => typeof counter !== "number" || !Number.isFinite(counter) || counter < 0)) return false;
  if (maybe.sourceMetrics !== undefined) {
    if (!maybe.sourceMetrics || typeof maybe.sourceMetrics !== "object") return false;
    for (const key of Object.keys(maybe.sourceMetrics)) {
      const metric = maybe.sourceMetrics[key];
      if (!metric || typeof metric !== "object") return false;
      const counters = [metric.impressions, metric.trialStarts, metric.planPurchases, metric.restores];
      if (counters.some((counter) => typeof counter !== "number" || !Number.isFinite(counter) || counter < 0)) return false;
    }
  }
  if (maybe.lastSource !== undefined && typeof maybe.lastSource !== "string") return false;
  if (maybe.lastActionAt !== undefined && (typeof maybe.lastActionAt !== "string" || !isValidDateString(maybe.lastActionAt))) return false;
  return true;
}

export function getDefaultMonetizationState(): MonetizationState {
  return { status: "free" };
}

export function getDefaultMonetizationPromptState(): MonetizationPromptState {
  return { shownCount: 0 };
}

export function getDefaultMonetizationExperimentState(variant?: PaywallVariant): MonetizationExperimentState {
  const assignedVariant = variant ?? (Math.random() < 0.5 ? "value-first" : "flex-first");
  return {
    variant: assignedVariant,
    assignedAt: new Date().toISOString(),
    impressions: 0,
    trialStarts: 0,
    planPurchases: 0,
    restores: 0,
    sourceMetrics: {},
  };
}

function normalizeExperimentState(state: MonetizationExperimentState): MonetizationExperimentState {
  return {
    ...state,
    sourceMetrics: state.sourceMetrics ?? {},
  };
}

function didNormalizeExperimentState(from: MonetizationExperimentState, to: MonetizationExperimentState): boolean {
  return from.sourceMetrics !== to.sourceMetrics;
}

async function persistExperimentStateBestEffort(storage: StorageLike, state: MonetizationExperimentState): Promise<void> {
  try {
    await saveMonetizationExperimentState(storage, state);
  } catch {
    // Loading analytics must remain safe even when local storage is unavailable.
  }
}

export async function loadMonetizationState(storage: StorageLike): Promise<MonetizationState> {
  const defaultState = getDefaultMonetizationState();

  try {
    const raw = await storage.getItem(MONETIZATION_STATE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as unknown;
    if (!isMonetizationState(parsed)) {
      await persistNormalizedMonetizationState(storage, defaultState);
      return defaultState;
    }

    const normalizedState = normalizeMonetizationState(parsed);
    if (didNormalizeMonetizationState(parsed, normalizedState)) {
      await persistNormalizedMonetizationState(storage, normalizedState);
    }
    return normalizedState;
  } catch {
    await persistNormalizedMonetizationState(storage, defaultState);
    return defaultState;
  }
}

export async function loadMonetizationPromptState(storage: StorageLike): Promise<MonetizationPromptState> {
  try {
    const raw = await storage.getItem(MONETIZATION_PROMPT_STATE_KEY);
    if (!raw) return getDefaultMonetizationPromptState();
    const parsed = JSON.parse(raw) as unknown;
    if (!isMonetizationPromptState(parsed)) return getDefaultMonetizationPromptState();
    const normalized = normalizePromptState(parsed);
    if (didNormalizePromptState(parsed, normalized)) {
      await persistPromptStateBestEffort(storage, normalized);
    }
    return normalized;
  } catch {
    return getDefaultMonetizationPromptState();
  }
}

export async function loadMonetizationExperimentState(storage: StorageLike): Promise<MonetizationExperimentState> {
  const defaultState = getDefaultMonetizationExperimentState();
  try {
    const raw = await storage.getItem(MONETIZATION_EXPERIMENT_KEY);
    if (!raw) {
      await persistExperimentStateBestEffort(storage, defaultState);
      return defaultState;
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isMonetizationExperimentState(parsed)) {
      await persistExperimentStateBestEffort(storage, defaultState);
      return defaultState;
    }
    const normalized = normalizeExperimentState(parsed);
    if (didNormalizeExperimentState(parsed, normalized)) {
      await persistExperimentStateBestEffort(storage, normalized);
    }
    return normalized;
  } catch {
    await persistExperimentStateBestEffort(storage, defaultState);
    return defaultState;
  }
}

export async function saveMonetizationState(storage: StorageLike, state: MonetizationState) {
  await storage.setItem(MONETIZATION_STATE_KEY, JSON.stringify(state));
}

export async function saveMonetizationPromptState(storage: StorageLike, state: MonetizationPromptState) {
  await storage.setItem(MONETIZATION_PROMPT_STATE_KEY, JSON.stringify(state));
}

export async function saveMonetizationExperimentState(storage: StorageLike, state: MonetizationExperimentState) {
  await storage.setItem(MONETIZATION_EXPERIMENT_KEY, JSON.stringify(state));
}

export async function startTrial(storage: StorageLike, source?: string): Promise<MonetizationState> {
  const current = await loadMonetizationState(storage);
  if (isPremiumActive(current)) return current;
  const trialEndsAt = new Date(Date.now() + TRIAL_LENGTH_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const next: MonetizationState = {
    status: "trial",
    planId: "annual",
    trialEndsAt,
    startedAt: new Date().toISOString(),
    source,
  };
  await saveMonetizationState(storage, next);
  return next;
}

export async function activatePlan(storage: StorageLike, planId: PlanId, source?: string): Promise<MonetizationState> {
  const current = await loadMonetizationState(storage);
  if (current.status === "active" && current.planId === planId) return current;
  const next: MonetizationState = {
    status: "active",
    planId,
    startedAt: new Date().toISOString(),
    source,
  };
  await saveMonetizationState(storage, next);
  return next;
}

export async function restoreMembership(storage: StorageLike): Promise<MonetizationState> {
  const current = await loadMonetizationState(storage);
  if (current.status === "active") return current;
  if (current.status === "trial" && isPremiumActive(current)) return current;
  const restored: MonetizationState = {
    status: "active",
    planId: "annual",
    startedAt: new Date().toISOString(),
    source: "restore",
  };
  await saveMonetizationState(storage, restored);
  return restored;
}

export function isPremiumActive(state: MonetizationState, now = Date.now()): boolean {
  if (state.status === "active") return true;
  if (state.status !== "trial" || !state.trialEndsAt) return false;
  return new Date(state.trialEndsAt).getTime() > now;
}

export function trialDaysLeft(state: MonetizationState, now = Date.now()): number {
  if (state.status !== "trial" || !state.trialEndsAt) return 0;
  const millis = new Date(state.trialEndsAt).getTime() - now;
  if (millis <= 0) return 0;
  return Math.ceil(millis / (24 * 60 * 60 * 1000));
}

export function getMembershipLabel(state: MonetizationState): string {
  if (state.status === "active") return `Rarely Plus · ${state.planId ?? "member"}`;
  if (state.status === "trial") return "Rarely Plus · trial";
  return "Rarely free";
}

export function orderPlansForVariant(plans: PlanDefinition[], variant: PaywallVariant): PlanDefinition[] {
  const rank: Record<PlanId, number> =
    variant === "value-first"
      ? { annual: 0, monthly: 1, lifetime: 2 }
      : { monthly: 0, annual: 1, lifetime: 2 };
  return [...plans].sort((a, b) => rank[a.id] - rank[b.id]);
}

function normalizeAnalyticsSource(source?: string): string {
  const normalized = source?.trim();
  return normalized || "unknown";
}

function createEmptySourceMetrics(): PaywallSourceMetrics {
  return {
    impressions: 0,
    trialStarts: 0,
    planPurchases: 0,
    restores: 0,
  };
}

export async function recordPaywallImpression(
  storage: StorageLike,
  source?: string,
): Promise<MonetizationExperimentState> {
  const current = await loadMonetizationExperimentState(storage);
  const sourceKey = normalizeAnalyticsSource(source);
  const sourceMetrics = current.sourceMetrics ?? {};
  const currentSource = sourceMetrics[sourceKey] ?? createEmptySourceMetrics();
  const next: MonetizationExperimentState = {
    ...current,
    impressions: current.impressions + 1,
    sourceMetrics: {
      ...sourceMetrics,
      [sourceKey]: {
        ...currentSource,
        impressions: currentSource.impressions + 1,
      },
    },
    lastSource: sourceKey,
    lastActionAt: new Date().toISOString(),
  };
  await persistExperimentStateBestEffort(storage, next);
  return next;
}

export async function recordPaywallConversion(
  storage: StorageLike,
  type: PaywallConversionType,
  source?: string,
): Promise<MonetizationExperimentState> {
  const current = await loadMonetizationExperimentState(storage);
  const sourceKey = normalizeAnalyticsSource(source);
  const sourceMetrics = current.sourceMetrics ?? {};
  const currentSource = sourceMetrics[sourceKey] ?? createEmptySourceMetrics();
  const next: MonetizationExperimentState = {
    ...current,
    trialStarts: current.trialStarts + (type === "trial" ? 1 : 0),
    planPurchases: current.planPurchases + (type === "purchase" ? 1 : 0),
    restores: current.restores + (type === "restore" ? 1 : 0),
    sourceMetrics: {
      ...sourceMetrics,
      [sourceKey]: {
        ...currentSource,
        trialStarts: currentSource.trialStarts + (type === "trial" ? 1 : 0),
        planPurchases: currentSource.planPurchases + (type === "purchase" ? 1 : 0),
        restores: currentSource.restores + (type === "restore" ? 1 : 0),
      },
    },
    lastSource: sourceKey,
    lastActionAt: new Date().toISOString(),
  };
  await persistExperimentStateBestEffort(storage, next);
  return next;
}

export function getPaywallConversionRate(state: MonetizationExperimentState): number {
  if (state.impressions <= 0) return 0;
  const totalConversions = state.trialStarts + state.planPurchases + state.restores;
  return totalConversions / state.impressions;
}

export function getPaywallSourceConversionRate(sourceMetrics: PaywallSourceMetrics): number {
  if (sourceMetrics.impressions <= 0) return 0;
  const conversions =
    sourceMetrics.trialStarts + sourceMetrics.planPurchases + sourceMetrics.restores;
  return conversions / sourceMetrics.impressions;
}

export function getRankedPaywallSources(
  state: MonetizationExperimentState,
): RankedPaywallSource[] {
  const metricsBySource = state.sourceMetrics ?? {};
  return Object.entries(metricsBySource)
    .map(([source, metrics]) => ({
      source,
      metrics,
      conversionRate: getPaywallSourceConversionRate(metrics),
    }))
    .sort((a, b) => {
      const aConversions = a.metrics.trialStarts + a.metrics.planPurchases + a.metrics.restores;
      const bConversions = b.metrics.trialStarts + b.metrics.planPurchases + b.metrics.restores;
      if (bConversions !== aConversions) return bConversions - aConversions;
      if (b.metrics.impressions !== a.metrics.impressions) return b.metrics.impressions - a.metrics.impressions;
      return b.conversionRate - a.conversionRate;
    });
}

export function getPaywallSourceLabel(source: string): string {
  if (source === "home_usage") return "Home usage prompt";
  if (source === "profile") return "Profile entry";
  if (source === "community_header") return "Community header";
  if (source === "studio_header") return "Studio header";
  if (source === "create_header") return "Create header";
  if (source.startsWith("create_tool_")) return `Create tool: ${source.replace("create_tool_", "")}`;
  if (source.startsWith("community_circle_")) return `Community circle: ${source.replace("community_circle_", "")}`;
  if (source.startsWith("studio_routine_")) return `Studio routine: ${source.replace("studio_routine_", "")}`;
  if (source === "membership") return "Membership screen";
  if (source === "unknown") return "Unknown source";
  return source.replaceAll("_", " ");
}

export function getPaywallSourceGroup(source: string): string {
  if (source.startsWith("create_tool_")) return "Create tools";
  if (source.startsWith("community_circle_")) return "Community circles";
  if (source.startsWith("studio_routine_")) return "Studio routines";
  if (source.startsWith("create_")) return "Create";
  if (source.startsWith("community_")) return "Community";
  if (source.startsWith("studio_")) return "Studio";
  if (source.startsWith("home")) return "Home";
  if (source === "profile") return "Profile";
  if (source === "membership") return "Membership";
  return "Other";
}

export function getRankedPaywallSourceGroups(state: MonetizationExperimentState): RankedPaywallSource[] {
  const grouped = new Map<string, PaywallSourceMetrics>();
  const sources = state.sourceMetrics ?? {};

  for (const [source, metrics] of Object.entries(sources)) {
    const group = getPaywallSourceGroup(source);
    const existing = grouped.get(group) ?? createEmptySourceMetrics();
    grouped.set(group, {
      impressions: existing.impressions + metrics.impressions,
      trialStarts: existing.trialStarts + metrics.trialStarts,
      planPurchases: existing.planPurchases + metrics.planPurchases,
      restores: existing.restores + metrics.restores,
    });
  }

  return [...grouped.entries()]
    .map(([source, metrics]) => ({
      source,
      metrics,
      conversionRate: getPaywallSourceConversionRate(metrics),
    }))
    .sort((a, b) => {
      const aConversions = a.metrics.trialStarts + a.metrics.planPurchases + a.metrics.restores;
      const bConversions = b.metrics.trialStarts + b.metrics.planPurchases + b.metrics.restores;
      if (bConversions !== aConversions) return bConversions - aConversions;
      if (b.metrics.impressions !== a.metrics.impressions) return b.metrics.impressions - a.metrics.impressions;
      return b.conversionRate - a.conversionRate;
    });
}

export async function resetMonetizationAnalytics(
  storage: StorageLike,
  preserveVariant = true,
): Promise<MonetizationExperimentState> {
  const current = preserveVariant ? await loadMonetizationExperimentState(storage) : undefined;
  const experiment = getDefaultMonetizationExperimentState(current?.variant);
  await persistPromptStateBestEffort(storage, getDefaultMonetizationPromptState());
  await persistExperimentStateBestEffort(storage, experiment);
  return experiment;
}

export function shouldTriggerUsageUpsell(usage: UsageSnapshot): boolean {
  const total = usage.journalCount + usage.momentCount + usage.circleCount + usage.routineCount;
  if (total >= 5) return true;
  if (usage.journalCount >= 2 && usage.momentCount >= 1) return true;
  if (usage.routineCount >= 2 || usage.circleCount >= 2) return true;
  return false;
}

export function canShowUpgradePrompt(promptState: MonetizationPromptState, now = Date.now()): boolean {
  if (promptState.shownCount >= MAX_PROMPT_IMPRESSIONS) return false;
  if (!promptState.lastShownAt) return true;
  const lastShownAtMs = new Date(promptState.lastShownAt).getTime();
  if (!Number.isFinite(lastShownAtMs)) return true;
  return now - lastShownAtMs >= PROMPT_COOLDOWN_MS;
}

export async function recordUpgradePromptShown(storage: StorageLike, source: string): Promise<MonetizationPromptState> {
  const current = await loadMonetizationPromptState(storage);
  if (current.shownCount >= MAX_PROMPT_IMPRESSIONS) return current;
  const next: MonetizationPromptState = {
    shownCount: Math.min(current.shownCount + 1, MAX_PROMPT_IMPRESSIONS),
    lastShownAt: new Date().toISOString(),
    lastSource: source,
  };
  await persistPromptStateBestEffort(storage, next);
  return next;
}
