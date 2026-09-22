export type AppleSignInState = 'idle'|'starting'|'authorizing'|'exchanging'|'linked'|'cancelled'|'failed';
export type AppleCredential = { user: string; email?: string; identityToken?: string; nonce: string; state: string };
export function transition(current: AppleSignInState, event: 'start'|'authorized'|'exchange'|'success'|'cancel'|'failure'): AppleSignInState {
  if (event === 'start' && current === 'idle') return 'starting';
  if (event === 'authorized' && (current === 'starting' || current === 'authorizing')) return 'exchanging';
  if (event === 'exchange' && current === 'exchanging') return 'linked';
  if (event === 'success' && current === 'exchanging') return 'linked';
  if (event === 'cancel') return 'cancelled';
  if (event === 'failure') return 'failed';
  return current;
}
export function validateCredential(credential: AppleCredential): string[] {
  const errors: string[] = [];
  if (!credential.user.trim()) errors.push('apple-user-required');
  if (!credential.nonce.trim()) errors.push('nonce-required');
  if (!credential.state.trim()) errors.push('state-required');
  return errors;
}
