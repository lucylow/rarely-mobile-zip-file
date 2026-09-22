export const JOURNAL_LIMITS = { title: 160, body: 50_000, attachmentCount: 12, attachmentBytes: 15_000_000 } as const;
export function validateJournalText(title: string, body: string): string[] { const issues: string[] = []; if (title.length > JOURNAL_LIMITS.title) issues.push('title-too-long'); if (body.length > JOURNAL_LIMITS.body) issues.push('body-too-long'); return issues; }
