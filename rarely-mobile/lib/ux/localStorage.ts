import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  normalizeRecommendationFeedback,
  type RecommendationFeedback,
  type AiCreativeMode,
  type AiPromptRefinement,
} from "../../lib/ux/personalization";
import { reportNonFatalError } from "../../lib/non-fatal-error";
import { safeJsonParse } from "../../lib/utils";

export type PersonalizationHistoryItem = {
  kind: string;
  value: string;
  at: string;
};

export type LocalActivityRecord = {
  id: string;
  name?: string;
  note?: string;
  imageUri?: string;
  joinedAt?: string;
  completedAt?: string;
};

const FEEDBACK_KEY = "rarely.personalizationFeedback";
const HISTORY_KEY = "rarely.personalizationHistory";
const AI_MODE_KEY = "rarely.aiMode";
const AI_PROMPT_HISTORY_KEY = "rarely.aiPromptHistory";

let feedbackWriteQueue: Promise<void> = Promise.resolve();
let historyWriteQueue: Promise<void> = Promise.resolve();

function safeIsoDate(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return Number.isFinite(Date.parse(value)) ? value : undefined;
}

function normalizeActivityRecord(value: unknown): LocalActivityRecord | null {
  if (typeof value === "string") {
    const id = value.trim();
    return id ? { id } : null;
  }
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.id !== "string" || !record.id.trim()) return null;
  return {
    id: record.id.trim(),
    name: typeof record.name === "string" ? record.name : undefined,
    note: typeof record.note === "string" ? record.note : undefined,
    imageUri: typeof record.imageUri === "string" ? record.imageUri : undefined,
    joinedAt: safeIsoDate(record.joinedAt),
    completedAt: safeIsoDate(record.completedAt),
  };
}

export function parseActivityRecords(value: string | null | undefined): LocalActivityRecord[] {
  const parsed = safeJsonParse<unknown>(value, []);
  if (!Array.isArray(parsed)) return [];
  const normalized = parsed
    .map((item) => normalizeActivityRecord(item))
    .filter((item): item is LocalActivityRecord => Boolean(item));
  const unique = new Map<string, LocalActivityRecord>();
  for (const item of normalized) {
    if (!unique.has(item.id)) unique.set(item.id, item);
  }
  return Array.from(unique.values());
}

function normalizeHistoryItem(value: unknown): PersonalizationHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.kind !== "string" || typeof item.value !== "string") return null;
  const at = safeIsoDate(item.at) ?? new Date().toISOString();
  return { kind: item.kind, value: item.value, at };
}

export async function clearRecommendationFeedback(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FEEDBACK_KEY);
  } catch (error) {
    reportNonFatalError("local-storage:clear-feedback", error);
    throw error;
  }
}

export async function loadRecommendationFeedback(): Promise<RecommendationFeedback> {
  try {
    const raw = safeJsonParse<unknown>(await AsyncStorage.getItem(FEEDBACK_KEY), {});
    return normalizeRecommendationFeedback(raw);
  } catch (error) {
    reportNonFatalError("local-storage:load-feedback", error);
    return {};
  }
}

export function saveRecommendationFeedback(feedback: RecommendationFeedback): Promise<void> {
  const normalized = normalizeRecommendationFeedback(feedback);
  const operation = feedbackWriteQueue.catch(() => undefined).then(async () => {
    try {
      await AsyncStorage.setItem(FEEDBACK_KEY, JSON.stringify(normalized));
    } catch (error) {
      reportNonFatalError("local-storage:save-feedback", error);
      throw error;
    }
  });
  feedbackWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function appendPersonalizationHistory(entry: PersonalizationHistoryItem): Promise<void> {
  const normalizedEntry = normalizeHistoryItem(entry);
  if (!normalizedEntry) return Promise.resolve();
  const operation = historyWriteQueue.catch(() => undefined).then(async () => {
    const history = await loadPersonalizationHistory();
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify([normalizedEntry, ...history].slice(0, 30)));
    } catch (error) {
      reportNonFatalError("local-storage:append-history", error, { kind: normalizedEntry.kind });
      throw error;
    }
  });
  historyWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function restorePersonalizationHistory(history: PersonalizationHistoryItem[]): Promise<void> {
  const normalizedHistory = history
    .map((item) => normalizeHistoryItem(item))
    .filter((item): item is PersonalizationHistoryItem => Boolean(item))
    .slice(0, 30);
  const operation = historyWriteQueue.catch(() => undefined).then(async () => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(normalizedHistory));
    } catch (error) {
      reportNonFatalError("local-storage:restore-history", error);
      throw error;
    }
  });
  historyWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export function clearPersonalizationHistory(): Promise<void> {
  const operation = historyWriteQueue.catch(() => undefined).then(async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
    } catch (error) {
      reportNonFatalError("local-storage:clear-history", error);
      throw error;
    }
  });
  historyWriteQueue = operation.then(() => undefined, () => undefined);
  return operation;
}

export type AiPromptHistoryItem = {
  prompt: string;
  mode?: AiCreativeMode;
  refinement?: AiPromptRefinement;
  feedback?: "useful" | "tryAnother";
  favorite?: boolean;
  at: string;
};

function normalizeAiPromptHistoryItem(value: unknown): AiPromptHistoryItem | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.prompt !== "string" || !item.prompt.trim()) return null;
  const mode = item.mode === "spark" || item.mode === "reflect" || item.mode === "play" ? item.mode : undefined;
  const refinement = item.refinement === "gentler" || item.refinement === "shorter" || item.refinement === "morePlayful" ? item.refinement : undefined;
  const feedback = item.feedback === "useful" || item.feedback === "tryAnother" ? item.feedback : undefined;
  const favorite = item.favorite === true ? true : undefined;
  return { prompt: item.prompt.trim().slice(0, 500), mode, refinement, feedback, favorite, at: safeIsoDate(item.at) ?? new Date().toISOString() };
}

export async function loadAiMode(): Promise<AiCreativeMode | null> {
  try {
    const value = await AsyncStorage.getItem(AI_MODE_KEY);
    return value === "spark" || value === "reflect" || value === "play" ? value : null;
  } catch (error) {
    reportNonFatalError("local-storage:load-ai-mode", error);
    return null;
  }
}

export async function saveAiMode(mode: AiCreativeMode): Promise<void> {
  try {
    await AsyncStorage.setItem(AI_MODE_KEY, mode);
  } catch (error) {
    reportNonFatalError("local-storage:save-ai-mode", error);
    throw error;
  }
}

export async function loadAiPromptHistory(): Promise<AiPromptHistoryItem[]> {
  try {
    const raw = safeJsonParse<unknown>(await AsyncStorage.getItem(AI_PROMPT_HISTORY_KEY), []);
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeAiPromptHistoryItem).filter((item): item is AiPromptHistoryItem => Boolean(item)).slice(0, 10);
  } catch (error) {
    reportNonFatalError("local-storage:load-ai-history", error);
    return [];
  }
}

export async function repairAiPromptHistory(): Promise<AiPromptHistoryItem[]> {
  try {
    const history = await loadAiPromptHistory();
    await AsyncStorage.setItem(AI_PROMPT_HISTORY_KEY, JSON.stringify(history));
    return history;
  } catch (error) {
    reportNonFatalError("local-storage:repair-ai-history", error);
    throw error;
  }
}

export async function restoreAiPromptHistory(history: AiPromptHistoryItem[]): Promise<void> {
  try {
    const normalized = history.map((item) => normalizeAiPromptHistoryItem(item)).filter((item): item is AiPromptHistoryItem => Boolean(item)).slice(0, 10);
    await AsyncStorage.setItem(AI_PROMPT_HISTORY_KEY, JSON.stringify(normalized));
  } catch (error) {
    reportNonFatalError("local-storage:restore-ai-history", error);
    throw error;
  }
}

export async function clearFavoriteAiPromptHistory(): Promise<void> {
  try {
    const history = await loadAiPromptHistory();
    await AsyncStorage.setItem(AI_PROMPT_HISTORY_KEY, JSON.stringify(history.filter((item) => !item.favorite)));
  } catch (error) {
    reportNonFatalError("local-storage:clear-ai-favorites", error);
    throw error;
  }
}

export async function clearAiPromptHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(AI_PROMPT_HISTORY_KEY);
  } catch (error) {
    reportNonFatalError("local-storage:clear-ai-history", error);
    throw error;
  }
}

export async function toggleAiPromptFavorite(at: string, prompt: string): Promise<AiPromptHistoryItem[]> {
  const history = await loadAiPromptHistory();
  const index = history.findIndex((item) => item.at === at && item.prompt === prompt);
  if (index < 0) return history;
  const next = history.map((item, itemIndex) =>
    itemIndex === index ? { ...item, favorite: !item.favorite } : item,
  );
  try {
    await AsyncStorage.setItem(AI_PROMPT_HISTORY_KEY, JSON.stringify(next));
    return next;
  } catch (error) {
    reportNonFatalError("local-storage:toggle-ai-favorite", error);
    return history;
  }
}

export async function deleteAiPromptHistoryItem(at: string, prompt: string): Promise<void> {
  try {
    const history = await loadAiPromptHistory();
    const index = history.findIndex((item) => item.at === at && item.prompt === prompt);
    if (index < 0) return;
    history.splice(index, 1);
    await AsyncStorage.setItem(AI_PROMPT_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    reportNonFatalError("local-storage:delete-ai-history", error);
    throw error;
  }
}

export async function appendAiPromptHistory(item: Omit<AiPromptHistoryItem, "at"> & { at?: string }): Promise<void> {
  const normalized = normalizeAiPromptHistoryItem({ ...item, at: item.at ?? new Date().toISOString() });
  if (!normalized) return;
  try {
    const history = await loadAiPromptHistory();
    await AsyncStorage.setItem(AI_PROMPT_HISTORY_KEY, JSON.stringify([normalized, ...history].slice(0, 10)));
  } catch (error) {
    reportNonFatalError("local-storage:append-ai-history", error);
    throw error;
  }
}

export async function loadPersonalizationHistory(): Promise<PersonalizationHistoryItem[]> {
  try {
    const raw = safeJsonParse<unknown>(await AsyncStorage.getItem(HISTORY_KEY), []);
    if (!Array.isArray(raw)) return [];
    return raw
      .map((item) => normalizeHistoryItem(item))
      .filter((item): item is PersonalizationHistoryItem => Boolean(item))
      .slice(0, 30);
  } catch (error) {
    reportNonFatalError("local-storage:load-history", error);
    return [];
  }
}
