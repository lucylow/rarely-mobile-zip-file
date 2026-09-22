import type { Surface } from "@/lib/ux/uxTypes";

export type Preferences = {
  creativity: number;
  community: number;
  beauty: number;
  journaling: number;
  music: number;
  notifications: boolean;
  quietHours: boolean;
};

function clampUnit(value: unknown, fallback = 0.5): number {
  const numeric = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(1, Math.max(0, numeric));
}

export function scorePreferences(input: Partial<Preferences>): Preferences {
  return {
    creativity: clampUnit(input.creativity),
    community: clampUnit(input.community),
    beauty: clampUnit(input.beauty),
    journaling: clampUnit(input.journaling),
    music: clampUnit(input.music),
    notifications: input.notifications ?? false,
    quietHours: input.quietHours ?? false,
  };
}

export function starterPath(preferences: Preferences): Surface[] {
  const ranked: [Surface, number][] = [
    ["create", preferences.creativity],
    ["community", preferences.community],
    ["rareStudio", preferences.beauty],
    ["home", preferences.music + preferences.journaling],
  ];
  return ranked.sort((a, b) => b[1] - a[1]).map(([surface]) => surface);
}
