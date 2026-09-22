export type AuthorizationStatus = 'unknown' | 'undetermined' | 'denied' | 'granted' | 'limited';

export interface PermissionState {
  notifications: AuthorizationStatus;
  photos: AuthorizationStatus;
  microphone: AuthorizationStatus;
  tracking: AuthorizationStatus;
}

export const DEFAULT_PERMISSION_STATE: PermissionState = {
  notifications: 'undetermined',
  photos: 'undetermined',
  microphone: 'undetermined',
  tracking: 'denied',
};

export function isGranted(status: AuthorizationStatus): boolean {
  return status === 'granted' || status === 'limited';
}

export function shouldExplainBeforeRequest(status: AuthorizationStatus): boolean {
  return status === 'denied' || status === 'limited';
}
