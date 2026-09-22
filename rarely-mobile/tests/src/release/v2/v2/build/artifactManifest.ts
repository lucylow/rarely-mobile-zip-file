import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';

export interface ArtifactEntry {
  path: string;
  bytes: number;
  sha256: string;
}

export async function fingerprintFile(path: string): Promise<ArtifactEntry> {
  const data = await readFile(path);
  return {
    path,
    bytes: data.byteLength,
    sha256: createHash('sha256').update(data).digest('hex'),
  };
}

export function verifySha256(expected: ArtifactEntry, actual: ArtifactEntry): boolean {
  return expected.path === actual.path && expected.bytes === actual.bytes && expected.sha256 === actual.sha256;
}

export function manifestJson(entries: ArtifactEntry[]): string {
  return JSON.stringify({ generatedAt: new Date().toISOString(), entries }, null, 2);
}
