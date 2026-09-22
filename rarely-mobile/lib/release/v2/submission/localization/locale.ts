export type AppLocale = { language: string; region?: string; decimalSeparator: string; dateOrder: 'mdy'|'dmy'|'ymd'; firstDayOfWeek: 0|1|6 };
export const LOCALES: Record<string, AppLocale> = {
  'en-US': { language: 'en', region: 'US', decimalSeparator: '.', dateOrder: 'mdy', firstDayOfWeek: 0 },
  'en-CA': { language: 'en', region: 'CA', decimalSeparator: '.', dateOrder: 'ymd', firstDayOfWeek: 0 },
  'fr-CA': { language: 'fr', region: 'CA', decimalSeparator: ',', dateOrder: 'ymd', firstDayOfWeek: 0 },
  'es-419': { language: 'es', region: '419', decimalSeparator: ',', dateOrder: 'dmy', firstDayOfWeek: 1 },
  'de-DE': { language: 'de', region: 'DE', decimalSeparator: ',', dateOrder: 'dmy', firstDayOfWeek: 1 },
  'ja-JP': { language: 'ja', region: 'JP', decimalSeparator: '.', dateOrder: 'ymd', firstDayOfWeek: 0 },
};
export function localeConfig(locale: string): AppLocale { return LOCALES[locale] ?? LOCALES['en-US']; }
export function formatDecimal(value: number, locale: string): string { return value.toLocaleString(locale, { maximumFractionDigits: 2 }); }
