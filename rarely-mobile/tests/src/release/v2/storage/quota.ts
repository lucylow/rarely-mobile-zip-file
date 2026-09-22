export interface Quota { maxBytes: number; usedBytes: number; }
export function canWrite(quota: Quota, incomingBytes: number): boolean { return incomingBytes >= 0 && quota.usedBytes + incomingBytes <= quota.maxBytes; }
export function remainingBytes(quota: Quota): number { return Math.max(0, quota.maxBytes - quota.usedBytes); }
export function reserve(quota: Quota, incomingBytes: number): Quota { if (!canWrite(quota, incomingBytes)) throw new Error('storage-quota-exceeded'); return { ...quota, usedBytes: quota.usedBytes + incomingBytes }; }
