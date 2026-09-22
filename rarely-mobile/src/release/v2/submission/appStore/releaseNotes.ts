export type ReleaseNote = { locale: string; text: string; reviewerSafe: boolean };
export const MAX_RELEASE_NOTE_CHARS = 4000;
export const DISALLOWED_NOTE_PATTERNS = [/guaranteed/i, /cures? /i, /medical advice/i, /free money/i];
export function validateReleaseNote(note: ReleaseNote): string[] {
  const errors: string[] = [];
  if (!note.locale.trim()) errors.push('locale-required');
  if (!note.text.trim()) errors.push('text-required');
  if (note.text.length > MAX_RELEASE_NOTE_CHARS) errors.push('too-long');
  for (const pattern of DISALLOWED_NOTE_PATTERNS) if (pattern.test(note.text)) errors.push(`pattern:${pattern.source}`);
  if (!note.reviewerSafe) errors.push('reviewer-safety-not-confirmed');
  return errors;
}
export function normalizeReleaseNote(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}
export function buildReleaseNote(notes: ReleaseNote[]): string {
  const valid = notes.filter((note) => validateReleaseNote(note).length === 0);
  return valid.map((note) => `${note.locale}: ${normalizeReleaseNote(note.text)}`).join('\n');
}
