export type PermissionName = 'camera'|'microphone'|'photos'|'notifications'|'tracking';
export type PermissionStatus = 'undetermined'|'denied'|'granted'|'limited';
export type PermissionAudit = { name: PermissionName; status: PermissionStatus; requested: boolean; reason: string };
export function actionable(item: PermissionAudit): boolean { return item.status === 'undetermined' || item.status === 'limited'; }
export function validateAudit(items: PermissionAudit[]): string[] {
  const errors: string[] = [];
  for (const item of items) {
    if (!item.reason.trim()) errors.push(`reason:${item.name}`);
    if (item.status === 'granted' && !item.requested) errors.push(`state:${item.name}`);
  }
  return errors;
}
export function deniedPermissions(items: PermissionAudit[]): PermissionName[] { return items.filter((x) => x.status === 'denied').map((x) => x.name); }
