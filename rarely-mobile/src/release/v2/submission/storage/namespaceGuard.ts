export const RESERVED_NAMESPACES = new Set(['auth','keys','payments','privacy','system']);
export function validNamespace(value: string): boolean { return /^[a-z][a-z0-9._-]{1,48}$/.test(value) && !RESERVED_NAMESPACES.has(value); }
export function key(namespace: string, id: string): string { if (!validNamespace(namespace)) throw new Error('invalid-namespace'); return `${namespace}:${id}`; }
