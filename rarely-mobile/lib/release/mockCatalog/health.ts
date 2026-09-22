export function catalogHealth<T extends { id: string }>(rows: T[]): { ok: boolean; duplicates: string[]; empty: boolean } {
  const ids = new Set<string>();
  const duplicates: string[] = [];
  for (const row of rows) {
    if (ids.has(row.id)) duplicates.push(row.id);
    ids.add(row.id);
  }
  return { ok: rows.length > 0 && duplicates.length === 0, duplicates, empty: rows.length === 0 };
}
