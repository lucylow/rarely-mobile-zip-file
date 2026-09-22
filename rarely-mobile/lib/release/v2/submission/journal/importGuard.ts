export type ImportCandidate = { filename: string; bytes: number; format: 'json'|'zip'|'unknown'; trusted: boolean };
export function validateCandidate(item: ImportCandidate): string[] { const errors: string[] = []; if (item.bytes <= 0) errors.push('empty'); if (item.bytes > 100 * 1024 * 1024) errors.push('too-large'); if (item.format === 'unknown') errors.push('unsupported-format'); if (!item.trusted) errors.push('untrusted'); return errors; }
export function safeExtension(filename: string): boolean { return /\.(json|zip)$/i.test(filename); }
