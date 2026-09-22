export type AiConsentReceipt = { userId: string; mode: 'spark'|'reflect'|'play'; grantedAt: number; scope: 'prompt-only'|'prompt-plus-preferences'; expiresAt?: number };
export function active(receipt: AiConsentReceipt, now = Date.now()): boolean { return receipt.grantedAt <= now && (receipt.expiresAt === undefined || receipt.expiresAt > now); }
export function narrow(receipt: AiConsentReceipt): AiConsentReceipt { return { ...receipt, scope: 'prompt-only' }; }
