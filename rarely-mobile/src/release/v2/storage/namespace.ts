export function storageKey(namespace: string, key: string): string { return `${namespace}:${key}`.replace(/[^A-Za-z0-9:_-]/g, '_').slice(0, 240); }
export function userStorageKey(userId: string, key: string): string { return storageKey(`user-${userId}`, key); }
export function globalStorageKey(key: string): string { return storageKey('global', key); }
