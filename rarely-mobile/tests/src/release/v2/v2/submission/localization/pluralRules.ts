export type Quantity = number;
export function pluralCategory(quantity: Quantity, locale: string): 'zero'|'one'|'two'|'few'|'many'|'other' { return new Intl.PluralRules(locale).select(quantity) as ReturnType<typeof pluralCategory>; }
export function pluralize(quantity: number, locale: string, singular: string, plural: string): string { return pluralCategory(quantity, locale) === 'one' ? singular : plural; }
export function countLabel(quantity: number, locale: string, noun: string): string { return `${quantity} ${pluralize(quantity, locale, noun, `${noun}s`)}`; }
