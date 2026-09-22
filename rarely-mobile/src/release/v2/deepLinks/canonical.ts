import { sanitizePathSegment } from './security';
export function canonicalMomentUrl(id: string): string { return `rarely://moment/${sanitizePathSegment(id)}`; }
export function canonicalJournalUrl(id: string): string { return `rarely://journal/${sanitizePathSegment(id)}`; }
export function canonicalRoutineUrl(id: string): string { return `rarely://routine/${sanitizePathSegment(id)}`; }
