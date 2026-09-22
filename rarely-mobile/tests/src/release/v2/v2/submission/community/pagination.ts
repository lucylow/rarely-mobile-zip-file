export type Page<T> = { items: T[]; nextCursor?: string; hasMore: boolean };
export function mergePages<T extends { id: string }>(pages: Page<T>[]): T[] { const seen = new Set<string>(); const out: T[] = []; for (const page of pages) for (const item of page.items) { if (!seen.has(item.id)) { seen.add(item.id); out.push(item); } } return out; }
export function nextCursor(page: Page<unknown>): string | null { return page.hasMore ? page.nextCursor ?? null : null; }
