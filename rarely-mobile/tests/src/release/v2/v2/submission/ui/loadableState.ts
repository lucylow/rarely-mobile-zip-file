export type LoadableState<T> = { status: 'idle'|'loading'|'refreshing'|'ready'|'empty'|'error'|'offline'; data?: T; error?: string; updatedAt?: number };
export function hasData<T>(state: LoadableState<T>): state is LoadableState<T> & { data: T } { return state.data !== undefined; }
export function isBlocking<T>(state: LoadableState<T>): boolean { return state.status === 'loading' && !hasData(state); }
export function recoveryLabel<T>(state: LoadableState<T>): string { if (state.status === 'offline') return 'Saved here. Sync will resume when you reconnect.'; if (state.status === 'error') return 'Try again'; if (state.status === 'empty') return 'Nothing here yet'; return hasData(state) ? 'Updated' : 'Loading'; }
