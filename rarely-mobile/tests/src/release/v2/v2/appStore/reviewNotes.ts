export interface ReviewNoteInput {
  feature: string;
  path: string;
  behavior: string;
  fallback: string;
}

export function buildReviewerNotes(notes: ReviewNoteInput[]): string {
  const header = 'RARELY App Review Notes\n\n';
  const body = notes.map((note, index) => [
    `${index + 1}. ${note.feature}`,
    `   Path: ${note.path}`,
    `   Behavior: ${note.behavior}`,
    `   Fallback: ${note.fallback}`,
  ].join('\n')).join('\n\n');
  return header + body;
}

export const DEFAULT_REVIEW_NOTES: ReviewNoteInput[] = [
  {
    feature: 'Private journal',
    path: 'Home → Create → Journal',
    behavior: 'Drafts save locally and remain available during temporary network failures.',
    fallback: 'If cloud sync fails, the local journal remains editable and queued for later sync.',
  },
  {
    feature: 'Premium membership',
    path: 'Profile → Membership',
    behavior: 'Purchases use Apple In-App Purchase through the native purchase gateway in production builds.',
    fallback: 'If StoreKit is unavailable, the app keeps existing entitlements and explains the temporary limitation.',
  },
  {
    feature: 'Account deletion',
    path: 'Profile → Settings → Account → Delete Account',
    behavior: 'Users can initiate deletion in the app after an explicit confirmation step.',
    fallback: 'If server deletion is delayed, the UI shows the request status and signs the user out after local cleanup.',
  },
];
