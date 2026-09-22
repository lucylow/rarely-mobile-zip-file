export type ChecksumRecord = { path: string; sha256: string; generatedAt: number };
export function validChecksum(value: string): boolean { return /^[a-f0-9]{64}$/i.test(value); }
export function assertUnique(records: ChecksumRecord[]): void {
  const seen = new Set<string>();
  for (const record of records) {
    if (!validChecksum(record.sha256)) throw new Error('checksum-invalid');
    if (seen.has(record.path)) throw new Error(`checksum-path-duplicate:${record.path}`);
    seen.add(record.path);
  }
}
export function serializeChecksums(records: ChecksumRecord[]): string {
  assertUnique(records);
  return [...records].sort((a,b) => a.path.localeCompare(b.path)).map((r) => `${r.sha256}  ${r.path}`).join('\n');
}
