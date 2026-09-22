export type Mood = "calm" | "creative" | "energized" | "tired" | "social" | "focused";
export type Surface = "home" | "create" | "community" | "rareStudio" | "profile";
export type UXIntent = { mood?: Mood; surface: Surface; entryPoint: string };
export type UXEvent = { name: string; ts: number; props?: Record<string, unknown> };

export const defaultUXIntent = (entryPoint = "cold_start"): UXIntent => ({
  surface: "home",
  entryPoint,
});
