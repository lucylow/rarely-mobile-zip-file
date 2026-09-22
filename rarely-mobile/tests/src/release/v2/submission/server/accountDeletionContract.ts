export type DeletionRequest = { requestId: string; userId: string; requestedAt: number; confirmation: string; subscriptionStatus: 'none'|'active'|'expired' };
export function validDeletion(request: DeletionRequest): string[] {
  const errors: string[] = [];
  if (!request.requestId.trim()) errors.push('request-id');
  if (!request.userId.trim()) errors.push('user-id');
  if (request.confirmation !== 'DELETE') errors.push('confirmation');
  if (request.requestedAt <= 0) errors.push('requested-at');
  return errors;
}
export function subscriptionNotice(status: DeletionRequest['subscriptionStatus']): string { return status === 'active' ? 'Your Apple subscription may remain active until you manage or cancel it in Apple settings.' : 'Your account deletion request can proceed.'; }
