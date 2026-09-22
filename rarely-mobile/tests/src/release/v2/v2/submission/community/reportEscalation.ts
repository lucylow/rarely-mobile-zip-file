export type Report = { id: string; severity: 1|2|3|4|5; category: 'spam'|'harassment'|'sexual'|'self-harm'|'other'; createdAt: number };
export function escalation(report: Report): 'none'|'review'|'urgent' { if (report.severity >= 5 || report.category === 'self-harm') return 'urgent'; if (report.severity >= 3) return 'review'; return 'none'; }
export function sortReports(items: Report[]): Report[] { return [...items].sort((a,b) => b.severity - a.severity || a.createdAt - b.createdAt); }
