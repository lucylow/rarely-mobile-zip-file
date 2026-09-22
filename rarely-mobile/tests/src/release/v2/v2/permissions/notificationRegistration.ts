export interface PushTokenState { token?: string; updatedAt?: number; permission: 'unknown' | 'denied' | 'granted'; }
export function canRegisterPush(state: PushTokenState): boolean { return state.permission === 'granted'; }
export function normalizePushToken(token: string): string { return token.trim().slice(0, 512); }
