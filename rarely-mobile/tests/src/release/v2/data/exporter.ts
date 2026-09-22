import { createHash } from 'node:crypto';

export interface ExportBundle {
  format: 'rarely-export-v1';
  createdAt: string;
  user: { id: string; displayName?: string };
  journals: unknown[];
  moments: unknown[];
  routines: unknown[];
  preferences: unknown;
  checksum: string;
}

export function createExportBundle(input: Omit<ExportBundle, 'format' | 'createdAt' | 'checksum'>, now = new Date()): ExportBundle {
  const unsigned = JSON.stringify(input);
  const checksum = createHash('sha256').update(unsigned).digest('hex');
  return { ...input, format: 'rarely-export-v1', createdAt: now.toISOString(), checksum };
}

export function verifyExportBundle(bundle: ExportBundle): boolean {
  const { checksum, format, createdAt, ...rest } = bundle;
  if (format !== 'rarely-export-v1' || !checksum || !createdAt) return false;
  const expected = createHash('sha256').update(JSON.stringify(rest)).digest('hex');
  return expected === checksum;
}
