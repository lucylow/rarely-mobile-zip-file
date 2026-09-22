export function looksLikeRefusal(text: string): boolean { return /I cannot|I can’t|unable to|not able to|I won't/i.test(text) && text.length < 800; }
export function safeAiMessage(text: string): string { return text.trim().slice(0, 8_000); }
