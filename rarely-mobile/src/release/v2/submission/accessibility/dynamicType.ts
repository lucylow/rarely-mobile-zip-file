export type TextScale = 0.8|0.9|1|1.1|1.2|1.35|1.5|1.7|2|3.2;
export function scaledFont(base: number, scale: TextScale, min = 10, max = 48): number { return Math.min(max, Math.max(min, Math.round(base * scale))); }
export function lineHeight(fontSize: number, multiplier = 1.35): number { return Math.ceil(fontSize * multiplier); }
export function fits(width: number, chars: number, fontSize: number, averageGlyph = 0.52): boolean { return chars * fontSize * averageGlyph <= width; }
export function truncationSafe(text: string, max: number): string { return text.length <= max ? text : `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`; }
