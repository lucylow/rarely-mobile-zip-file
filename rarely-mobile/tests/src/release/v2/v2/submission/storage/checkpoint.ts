export type Checkpoint<T> = { id: string; version: number; value: T; updatedAt: number; checksum: string };
export function createCheckpoint<T>(id: string, value: T, checksum: string, now = Date.now()): Checkpoint<T> { return { id, version: 1, value, updatedAt: now, checksum }; }
export function newer<T>(a: Checkpoint<T>, b: Checkpoint<T>): Checkpoint<T> { return a.updatedAt >= b.updatedAt ? a : b; }
export function valid<T>(checkpoint: Checkpoint<T>, verify: (value: T, checksum: string) => boolean): boolean { return verify(checkpoint.value, checkpoint.checksum); }
