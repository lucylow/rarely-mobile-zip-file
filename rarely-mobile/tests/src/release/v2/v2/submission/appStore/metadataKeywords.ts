export type KeywordCheck = { value: string; ok: boolean; reason?: string };
export const APP_STORE_KEYWORD_LIMIT = 100;
export const RESERVED_KEYWORDS = new Set(['free', 'official', 'apple', 'ios', 'app store']);
export function normalizeKeywords(input: string): string[] {
  return input.split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
}
export function validateKeywords(input: string): KeywordCheck[] {
  const normalized = normalizeKeywords(input);
  const total = normalized.join(',').length;
  return normalized.map((value) => ({
    value,
    ok: value.length >= 2 && value.length <= 30 && !RESERVED_KEYWORDS.has(value) && total <= APP_STORE_KEYWORD_LIMIT,
    reason: value.length < 2 ? 'too-short' : value.length > 30 ? 'too-long' : RESERVED_KEYWORDS.has(value) ? 'reserved' : total > APP_STORE_KEYWORD_LIMIT ? 'total-too-long' : undefined,
  }));
}
export function buildKeywordPayload(values: string[]): string {
  return [...new Set(values.map((v) => v.trim().toLowerCase()).filter(Boolean))].join(',').slice(0, APP_STORE_KEYWORD_LIMIT);
}
export function assertKeywordPayload(value: string): void {
  if (value.length > APP_STORE_KEYWORD_LIMIT) throw new Error('app-store-keywords-over-limit');
  const checks = validateKeywords(value);
  if (checks.some((c) => !c.ok)) throw new Error('app-store-keywords-invalid');
}
