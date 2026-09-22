let sequence = 0;
export function requestId(prefix = 'req', now = Date.now()): string { sequence += 1; return `${prefix}_${now.toString(36)}_${sequence.toString(36)}`; }
export function isRequestId(value: string): boolean { return /^[a-z]+_[a-z0-9]+_[a-z0-9]+$/.test(value); }
