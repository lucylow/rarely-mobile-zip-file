import { isGranted, type AuthorizationStatus, type PermissionState } from './model';

export interface PermissionCenter {
  getState(): Promise<PermissionState>;
  request(kind: keyof PermissionState): Promise<AuthorizationStatus>;
  openSettings(): Promise<void>;
}

export async function requestWithExplanation(center: PermissionCenter, kind: keyof PermissionState, explain: () => Promise<boolean>): Promise<AuthorizationStatus> {
  const state = await center.getState();
  const current = state[kind];
  if (isGranted(current)) return current;
  const proceed = await explain();
  if (!proceed) return current;
  return center.request(kind);
}
