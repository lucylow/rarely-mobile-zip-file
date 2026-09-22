export type CircleAccess = { circleId: string; userId: string; role: 'owner'|'moderator'|'member'|'blocked'; joinedAt: number; muted: boolean };
export function canPost(access: CircleAccess): boolean { return access.role !== 'blocked' && !access.muted; }
export function canModerate(access: CircleAccess): boolean { return access.role === 'owner' || access.role === 'moderator'; }
export function canInvite(access: CircleAccess): boolean { return access.role === 'owner' || access.role === 'moderator'; }
