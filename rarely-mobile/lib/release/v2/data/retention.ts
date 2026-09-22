export interface RetentionRule {
  name: string;
  maxAgeDays: number;
  reason: string;
  deleteAutomatically: boolean;
}

export const RETENTION_RULES: readonly RetentionRule[] = [
  { name: 'analytics-events', maxAgeDays: 90, reason: 'Operational analytics minimization.', deleteAutomatically: true },
  { name: 'expired-session-records', maxAgeDays: 30, reason: 'Security cleanup.', deleteAutomatically: true },
  { name: 'failed-webhook-attempts', maxAgeDays: 30, reason: 'Operational troubleshooting.', deleteAutomatically: true },
  { name: 'journal-content', maxAgeDays: Number.POSITIVE_INFINITY, reason: 'User content until user deletion.', deleteAutomatically: false },
];

export function shouldRetain(rule: RetentionRule, ageDays: number): boolean {
  return ageDays <= rule.maxAgeDays;
}
