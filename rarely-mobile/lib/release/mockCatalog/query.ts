export interface QueryOptions { query?: string; limit?: number; offset?: number; }

export function normalizeQuery(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ").slice(0, 120);
}

export function searchRecords<T extends Record<string, unknown>>(records: T[], fields: (keyof T)[], options: QueryOptions): T[] {
  const query = normalizeQuery(options.query);
  const limit = Math.max(0, Math.min(options.limit ?? 20, 100));
  const offset = Math.max(0, options.offset ?? 0);
  if (!query) return records.slice(offset, offset + limit);
  const matched = records.filter((record) => fields.some((field) => String(record[field] ?? "").toLowerCase().includes(query)));
  return matched.slice(offset, offset + limit);
}

export function paginate<T>(records: T[], page: number, pageSize: number): { items: T[]; page: number; pageSize: number; total: number; hasNext: boolean } {
  const safePage = Math.max(1, page);
  const safeSize = Math.max(1, Math.min(100, pageSize));
  const start = (safePage - 1) * safeSize;
  return { items: records.slice(start, start + safeSize), page: safePage, pageSize: safeSize, total: records.length, hasNext: start + safeSize < records.length };
}
