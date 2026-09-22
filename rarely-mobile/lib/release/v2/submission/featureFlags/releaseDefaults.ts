export type ReleaseFlag = { key: string; defaultValue: boolean; requiredForReview: boolean };
export const RELEASE_FLAGS: ReleaseFlag[] = [
  { key: 'offline-journal', defaultValue: true, requiredForReview: true },
  { key: 'restore-purchases', defaultValue: true, requiredForReview: true },
  { key: 'account-deletion', defaultValue: true, requiredForReview: true },
  { key: 'privacy-controls', defaultValue: true, requiredForReview: true },
  { key: 'ai-consent', defaultValue: true, requiredForReview: true },
  { key: 'community-reports', defaultValue: true, requiredForReview: false },
];
export function defaultFlag(key: string): boolean { return RELEASE_FLAGS.find((x) => x.key === key)?.defaultValue ?? false; }
