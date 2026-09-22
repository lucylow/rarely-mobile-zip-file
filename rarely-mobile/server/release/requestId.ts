export function ensureRequestId(input: string | undefined): string { return input && /^[A-Za-z0-9._-]{8,120}$/.test(input) ? input : `r_${Date.now().toString(36)}`; }
