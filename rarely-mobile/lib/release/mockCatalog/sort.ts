export function sortByNewest<T extends { createdAt?: string }>(rows: T[]): T[] { return [...rows].sort((a,b) => String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""))); }
