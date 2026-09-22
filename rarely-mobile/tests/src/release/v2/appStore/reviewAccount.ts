export interface ReviewerAccount { email: string; password?: string; notes: string; }
export function validateReviewerAccount(account: ReviewerAccount | undefined): string[] { if (!account) return []; const errors: string[] = []; if (!/^\S+@\S+\.\S+$/.test(account.email)) errors.push('review-email-invalid'); if (!account.notes.trim()) errors.push('review-notes-empty'); return errors; }
