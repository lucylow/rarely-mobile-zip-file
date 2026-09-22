export type RightsStatus = 'verified' | 'pending' | 'blocked';
export type ContentRight = { assetId: string; source: 'user' | 'owned' | 'licensed' | 'generated'; status: RightsStatus; expiresAt?: number };
export function isPublishable(right: ContentRight, now: number = Date.now()): boolean {
  if (right.status !== 'verified') return false;
  if (right.expiresAt !== undefined && right.expiresAt <= now) return false;
  return true;
}
export function validateRights(rights: ContentRight[], assetIds: string[]): string[] {
  const errors: string[] = [];
  for (const assetId of assetIds) {
    const right = rights.find((r) => r.assetId === assetId);
    if (!right) errors.push(`missing:${assetId}`);
    else if (!isPublishable(right)) errors.push(`blocked:${assetId}`);
  }
  return errors;
}
export function rightsSummary(rights: ContentRight[]): { verified: number; pending: number; blocked: number } {
  return rights.reduce((sum, right) => {
    sum[right.status] += 1;
    return sum;
  }, { verified: 0, pending: 0, blocked: 0 });
}
