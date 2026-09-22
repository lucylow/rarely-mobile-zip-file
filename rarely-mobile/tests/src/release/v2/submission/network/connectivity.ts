export type Connectivity = { reachable: boolean; type: 'wifi'|'cellular'|'none'|'unknown'; checkedAt: number };
export function allowUpload(state: Connectivity, requireWifi: boolean): boolean { return state.reachable && (!requireWifi || state.type === 'wifi'); }
export function statusLabel(state: Connectivity): string { return state.reachable ? state.type : 'offline'; }
export function stale(state: Connectivity, now = Date.now(), ttl = 60_000): boolean { return now - state.checkedAt > ttl; }
