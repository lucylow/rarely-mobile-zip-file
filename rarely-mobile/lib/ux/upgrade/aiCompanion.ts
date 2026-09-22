import type { AiMode } from "./types";
import { stableHash } from "./ids";

export interface AiCompanionRequest {
  mode: AiMode;
  prompt: string;
  creativeGoal?: string;
  selectedTags?: string[];
  consent: boolean;
}

export interface AiCompanionResult {
  mode: AiMode;
  title: string;
  body: string;
  nextStep?: string;
  source: "ai" | "fallback";
  promptVersion: string;
  safe: boolean;
  reason?: string;
}

export interface AiTransport {
  generate(input: { mode: AiMode; prompt: string; context: Record<string, unknown> }): Promise<unknown>;
}

export const AI_COMPANION_PROMPT_VERSION = "rarely-upgrade-ai-v1";

const SECRET_PATTERNS = [
  /\b(?:password|passcode|secret|api[_ -]?key|token)\b/i,
  /\b(?:sk|pk)_[A-Za-z0-9_-]{12,}\b/,
  /\b\d{3}-\d{2}-\d{4}\b/,
  /\b\d{13,19}\b/,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
];

export class AiCompanion {
  constructor(private readonly transport: AiTransport, private readonly consentProvider: () => boolean) {}

  async run(request: AiCompanionRequest): Promise<AiCompanionResult> {
    const sanitized = sanitizeInput(request.prompt);
    if (!(request.consent && this.consentProvider())) return fallback(request.mode, "consent_required", sanitized);
    if (containsSecretLikeContent(sanitized)) return fallback(request.mode, "private_or_secret_like_content", sanitized);
    const prompt = limitPrompt(sanitized);
    try {
      const raw = await this.transport.generate({
        mode: request.mode,
        prompt,
        context: {
          creativeGoal: request.creativeGoal?.slice(0, 300),
          selectedTags: (request.selectedTags ?? []).slice(0, 8),
          promptVersion: AI_COMPANION_PROMPT_VERSION,
        },
      });
      const parsed = parseResult(raw, request.mode);
      if (!parsed) return fallback(request.mode, "invalid_model_output", prompt);
      return { ...parsed, source: "ai", promptVersion: AI_COMPANION_PROMPT_VERSION, safe: true };
    } catch {
      return fallback(request.mode, "transport_failed", prompt);
    }
  }
}

function sanitizeInput(input: string): string {
  return input.replace(/\u0000/g, "").replace(/\s+/g, " ").trim();
}

function limitPrompt(input: string, max = 1200): string { return input.slice(0, max); }

function containsSecretLikeContent(input: string): boolean {
  return SECRET_PATTERNS.some((pattern) => pattern.test(input));
}

function parseResult(raw: unknown, mode: AiMode): Omit<AiCompanionResult, "source" | "promptVersion" | "safe" | "reason"> | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (typeof item.title !== "string" || typeof item.body !== "string") return null;
  const title = item.title.trim().slice(0, 80);
  const body = item.body.trim().slice(0, 800);
  if (!title || !body) return null;
  return {
    mode,
    title,
    body,
    nextStep: typeof item.nextStep === "string" ? item.nextStep.trim().slice(0, 220) : undefined,
  };
}

function fallback(mode: AiMode, reason: string, seedInput: string): AiCompanionResult {
  const sets: Record<AiMode, Array<{ title: string; body: string; nextStep: string }>> = {
    Spark: [
      { title: "Start with one strange detail", body: "Pick one small thing around you and describe it as if you are seeing it for the first time.", nextStep: "Write three words." },
      { title: "Turn a color into a story", body: "Choose the nearest interesting color. Give it a memory, a mood, or a made-up meaning.", nextStep: "Name the color." },
      { title: "Make a tiny rule", body: "Create one playful constraint for your next five minutes. Let the limitation make the idea easier.", nextStep: "Choose the constraint." },
    ],
    Reflect: [
      { title: "One honest sentence", body: "Finish this without editing yourself: “What I actually need today is…”", nextStep: "Keep the first answer." },
      { title: "Notice, do not solve", body: "Name one feeling or tension that is present. You do not need to explain it or fix it.", nextStep: "Give it a two-word name." },
      { title: "Look back gently", body: "Think of one recent moment that felt more like you. What made it feel different?", nextStep: "Write one reason." },
    ],
    Play: [
      { title: "Remix a familiar thing", body: "Take something ordinary and give it an unexpected use, title, or character.", nextStep: "Make three versions." },
      { title: "Two-word moodboard", body: "Pick two words that do not usually sit together. Build a tiny creative prompt from the pair.", nextStep: "Choose your words." },
      { title: "Make it unnecessarily beautiful", body: "For one minute, improve an ordinary detail just because you can.", nextStep: "Choose the detail." },
    ],
  };
  const selected = sets[mode][parseInt(stableHash(`${mode}:${seedInput}`).slice(-2), 16) % 3];
  return { mode, ...selected, source: "fallback", promptVersion: AI_COMPANION_PROMPT_VERSION, safe: true, reason };
}

export { containsSecretLikeContent };
