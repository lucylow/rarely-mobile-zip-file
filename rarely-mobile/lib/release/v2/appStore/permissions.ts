export type PermissionKind = 'notifications' | 'photos' | 'microphone' | 'tracking';

export interface PermissionDeclaration {
  kind: PermissionKind;
  requestedByDefault: boolean;
  purpose: string;
  fallback: string;
}

export const PERMISSIONS: readonly PermissionDeclaration[] = [
  {
    kind: 'notifications',
    requestedByDefault: false,
    purpose: 'Optional reminders for selected creative rituals and routines.',
    fallback: 'Users can complete routines without notifications.',
  },
  {
    kind: 'photos',
    requestedByDefault: false,
    purpose: 'Optional photo prompts and scrapbook attachments.',
    fallback: 'Journal and text-based experiences remain available without photo access.',
  },
  {
    kind: 'microphone',
    requestedByDefault: false,
    purpose: 'Optional audio capture for creative moments.',
    fallback: 'Typed journaling and other creative tools remain available.',
  },
  {
    kind: 'tracking',
    requestedByDefault: false,
    purpose: 'Not part of the core app experience. Keep disabled unless a future product decision requires ATT-compliant tracking.',
    fallback: 'The app remains useful without tracking authorization.',
  },
];

export function permissionSummary(): string[] {
  return PERMISSIONS.map((permission) => `${permission.kind}: ${permission.purpose}`);
}
