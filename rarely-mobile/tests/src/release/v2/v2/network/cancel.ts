export interface CancelSource { cancelled: boolean; reason?: string; }
export function makeCancelSource(): CancelSource { return { cancelled: false }; }
export function cancel(source: CancelSource, reason = 'cancelled'): void { source.cancelled = true; source.reason = reason; }
export function assertNotCancelled(source: CancelSource): void { if (source.cancelled) throw new Error(source.reason ?? 'cancelled'); }
