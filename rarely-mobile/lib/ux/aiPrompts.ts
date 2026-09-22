import type { AiCreativeMode } from "./personalization";

export const AI_PROMPT_VERSION = "2026-08-22.1";

export function isAiPromptGovernanceEnabled(): boolean {
  return process.env.EXPO_PUBLIC_RARELY_AI_PROMPTS_ENABLED !== "false";
}

const FALLBACK_PROMPTS: Record<AiCreativeMode, string> = {
  spark: "Start with one small idea you can notice or make in five minutes.",
  reflect: "Start with one small detail from this moment that feels worth keeping.",
  play: "Start with one color or sound and imagine where it could lead.",
};

export function getAiPromptPolicy(mode: AiCreativeMode, enabled = isAiPromptGovernanceEnabled()) {
  return {
    version: AI_PROMPT_VERSION,
    enabled,
    privacyBoundary: "Never use private journal text or images.",
    fallback: FALLBACK_PROMPTS[mode],
  } as const;
}

export function getAiGovernanceDisclosure(source: "governed" | "private-fallback" = "governed"): string {
  return source === "private-fallback"
    ? `Private fallback prompt · v${AI_PROMPT_VERSION} · nothing was sent anywhere.`
    : `Privacy-safe prompt · v${AI_PROMPT_VERSION} · private journal text and images stay on this device.`;
}
