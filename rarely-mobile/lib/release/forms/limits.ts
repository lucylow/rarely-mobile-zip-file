export interface TextLimits { title: number; body: number; prompt: number; displayName: number; }
export const TEXT_LIMITS: TextLimits = { title: 80, body: 8_000, prompt: 500, displayName: 40 };

export function limitText(value: string, max: number): string { return value.length <= max ? value : value.slice(0, max); }
export function hasMeaningfulText(value: string): boolean { return value.trim().length >= 1; }
