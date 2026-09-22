export interface FilterState { mood?: string; category?: string; durationMax?: number; favoritesOnly?: boolean; }
export const DEFAULT_FILTERS: FilterState = {};

export function sanitizeFilters(input: Partial<FilterState>): FilterState {
  return {
    mood: typeof input.mood === "string" ? input.mood.trim().slice(0, 40) || undefined : undefined,
    category: typeof input.category === "string" ? input.category.trim().slice(0, 40) || undefined : undefined,
    durationMax: typeof input.durationMax === "number" && Number.isFinite(input.durationMax) ? Math.max(1, Math.min(120, Math.round(input.durationMax))) : undefined,
    favoritesOnly: input.favoritesOnly === true ? true : undefined,
  };
}
