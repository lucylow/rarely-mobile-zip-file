import type { Mood, UXIntent, Surface } from "@/lib/ux/uxTypes";

export const moodOptions: Mood[] = ["calm", "creative", "energized", "tired", "social", "focused"];

export function moodPrompt(mood: Mood) {
  const copy: Record<Mood, string> = {
    calm: "Keep the quiet going.",
    creative: "Let’s make something.",
    energized: "Put that energy somewhere fun.",
    tired: "Choose something gentle.",
    social: "Find a positive connection.",
    focused: "Let’s make progress.",
  };
  return copy[mood];
}

export function nextExperience(mood: Mood): UXIntent {
  const map: Record<Mood, Surface> = {
    calm: "home",
    creative: "create",
    energized: "create",
    tired: "home",
    social: "community",
    focused: "create",
  };
  return { mood, surface: map[mood], entryPoint: `mood:${mood}` };
}
