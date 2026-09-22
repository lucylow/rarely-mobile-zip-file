import { batch } from './batch';
export interface SyncMutation { id: string; payload: unknown; attempts: number; }
export interface SyncTransport { send(mutations: SyncMutation[]): Promise<void>; }
export async function flushMutations(mutations: SyncMutation[], transport: SyncTransport, batchSize = 25): Promise<{ sent: number; failed: number }> { let sent = 0; let failed = 0; for (const group of batch(mutations, batchSize)) { try { await transport.send(group); sent += group.length; } catch { failed += group.length; } } return { sent, failed }; }
