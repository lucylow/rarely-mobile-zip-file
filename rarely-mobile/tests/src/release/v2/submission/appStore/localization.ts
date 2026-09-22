export type SupportedLocale = 'en-US' | 'en-CA' | 'fr-CA' | 'es-419' | 'de-DE' | 'ja-JP';
export type LocalizedValue = Partial<Record<SupportedLocale, string>>;
export const DEFAULT_LOCALE: SupportedLocale = 'en-US';
export function resolveLocale(requested: string | null | undefined): SupportedLocale {
  if (!requested) return DEFAULT_LOCALE;
  const normalized = requested.replace('_', '-');
  const exact = normalized as SupportedLocale;
  if (exact === 'en-US' || exact === 'en-CA' || exact === 'fr-CA' || exact === 'es-419' || exact === 'de-DE' || exact === 'ja-JP') return exact;
  const language = normalized.split('-')[0];
  if (language === 'fr') return 'fr-CA';
  if (language === 'de') return 'de-DE';
  if (language === 'ja') return 'ja-JP';
  if (language === 'es') return 'es-419';
  if (language === 'en') return 'en-US';
  return DEFAULT_LOCALE;
}
export function localized(value: LocalizedValue, locale: string | null | undefined): string {
  const resolved = resolveLocale(locale);
  return value[resolved] ?? value[DEFAULT_LOCALE] ?? Object.values(value).find(Boolean) ?? '';
}
export function assertLocalized(value: LocalizedValue): void {
  if (!value[DEFAULT_LOCALE]?.trim()) throw new Error('missing-default-locale');
}
export function coverage(values: LocalizedValue[]): Record<SupportedLocale, number> {
  const result = {} as Record<SupportedLocale, number>;
  for (const locale of ['en-US','en-CA','fr-CA','es-419','de-DE','ja-JP'] as SupportedLocale[]) {
    result[locale] = values.length ? Math.round(values.filter((v) => Boolean(v[locale]?.trim())).length / values.length * 100) : 100;
  }
  return result;
}
