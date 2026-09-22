export type DeletionResource = 'profile' | 'journals' | 'media' | 'community-posts' | 'community-comments' | 'preferences' | 'ai-history' | 'sync-outbox' | 'purchase-links';

export interface DeletionStep {
  resource: DeletionResource;
  required: boolean;
  completed: boolean;
  detail: string;
}

export const DEFAULT_DELETION_STEPS: readonly DeletionStep[] = [
  { resource: 'profile', required: true, completed: false, detail: 'Delete account profile and authentication record.' },
  { resource: 'journals', required: true, completed: false, detail: 'Delete private journal content and drafts.' },
  { resource: 'media', required: true, completed: false, detail: 'Delete account-owned uploads and attachment references.' },
  { resource: 'community-posts', required: true, completed: false, detail: 'Delete or anonymize account-owned community posts according to policy.' },
  { resource: 'community-comments', required: true, completed: false, detail: 'Delete or anonymize comments authored by the account.' },
  { resource: 'preferences', required: true, completed: false, detail: 'Delete personalization and settings data.' },
  { resource: 'ai-history', required: true, completed: false, detail: 'Delete stored AI prompt/result history if retained.' },
  { resource: 'sync-outbox', required: true, completed: false, detail: 'Delete pending cloud synchronization payloads.' },
  { resource: 'purchase-links', required: false, completed: false, detail: 'Detach app user mapping from the external billing/customer record; billing is controlled by Apple.' },
];

export function hasBlockingDeletionSteps(steps: DeletionStep[]): boolean {
  return steps.some((step) => step.required && !step.completed);
}
