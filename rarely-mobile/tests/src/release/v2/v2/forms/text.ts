export function normalizeUserText(value: string, max = 50_000): string {
  return value.replace(/\u0000/g, '').replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim().slice(0, max);
}
export function countGraphemeSafe(value: string): number { return Array.from(value).length; }
export function hasControlCharacters(value: string): boolean { return /[\u0001-\u0008\u000B\u000C\u000E-\u001F]/.test(value); }
export function safePlaceholder(value: string, fallback: string): string { const clean = normalizeUserText(value, 200); return clean || fallback; }
