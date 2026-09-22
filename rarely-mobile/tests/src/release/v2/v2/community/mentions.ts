export interface Mention { handle: string; start: number; end: number; }
export function parseMentions(text: string): Mention[] { const matches = text.matchAll(/@([A-Za-z0-9_.-]{2,32})/g); return [...matches].map((match) => ({ handle: match[1], start: match.index ?? 0, end: (match.index ?? 0) + match[0].length })); }
