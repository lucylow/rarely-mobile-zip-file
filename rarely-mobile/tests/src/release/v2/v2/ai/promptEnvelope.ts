export interface PromptEnvelope { mode: string; prompt: string; consent: boolean; clientVersion: string; }
export function makePromptEnvelope(input: PromptEnvelope): PromptEnvelope { if (!input.consent) throw new Error('ai-consent-required'); return { mode: input.mode.slice(0, 40), prompt: input.prompt.slice(0, 4_000), consent: true, clientVersion: input.clientVersion.slice(0, 32) }; }
