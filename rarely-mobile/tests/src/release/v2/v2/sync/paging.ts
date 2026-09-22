export interface Page<T> { items: T[]; nextCursor?: string; }
export function mergePages<T extends { id: string }>(pages: Array<Page<T>>): T[] { const map = new Map<string, T>(); for (const page of pages) for (const item of page.items) map.set(item.id, item); return [...map.values()]; }
