export type ReportReason = 'harassment' | 'spam' | 'privacy' | 'self-harm' | 'illegal' | 'other';

export interface Report {
  id: string;
  postId: string;
  reporterUserId: string;
  reason: ReportReason;
  createdAt: number;
  status: 'open' | 'triaged' | 'resolved';
}

export class ReportQueue {
  private readonly reports = new Map<string, Report>();

  add(report: Report): void {
    if (this.reports.has(report.id)) return;
    this.reports.set(report.id, report);
  }

  listOpen(): Report[] {
    return [...this.reports.values()].filter((report) => report.status !== 'resolved').sort((a, b) => a.createdAt - b.createdAt);
  }

  resolve(id: string): boolean {
    const report = this.reports.get(id);
    if (!report) return false;
    report.status = 'resolved';
    return true;
  }
}
