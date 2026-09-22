import type { MemoryItem } from "./types";

export type UpgradeStarterPath = "make" | "reflect" | "connect" | "reset";

export interface UpgradeOnboardingState {
  version: 1;
  completed: boolean;
  path?: UpgradeStarterPath;
  selectedTags: string[];
  remindersEnabled: boolean;
}

export const DEFAULT_ONBOARDING: UpgradeOnboardingState = {
  version: 1,
  completed: false,
  selectedTags: [],
  remindersEnabled: false,
};

export function chooseStarterPath(memories: MemoryItem[]): UpgradeStarterPath {
  if (memories.some((memory) => memory.kind === "creative-medium")) return "make";
  if (memories.some((memory) => memory.kind === "routine")) return "reset";
  if (memories.some((memory) => memory.kind === "community")) return "connect";
  return "reflect";
}

export function starterSteps(path: UpgradeStarterPath): string[] {
  switch (path) {
    case "make": return ["Pick one medium", "Make for ten minutes", "Keep one detail"];
    case "reflect": return ["Check in", "Write one line", "Save or let it go"];
    case "connect": return ["Choose a circle", "Read one post", "Add one kind reaction"];
    case "reset": return ["Breathe", "Notice", "Choose one next thing"];
  }
}

export function validateOnboarding(value: unknown): UpgradeOnboardingState {
  if (!value || typeof value !== "object") return { ...DEFAULT_ONBOARDING };
  const item = value as Record<string, unknown>;
  const path = item.path === "make" || item.path === "reflect" || item.path === "connect" || item.path === "reset" ? item.path : undefined;
  return {
    version: 1,
    completed: item.completed === true,
    path,
    selectedTags: Array.isArray(item.selectedTags) ? item.selectedTags.filter((tag): tag is string => typeof tag === "string").slice(0, 12) : [],
    remindersEnabled: item.remindersEnabled === true,
  };
}
