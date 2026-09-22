export type TransactionKind = "write" | "delete" | "repair" | "migration";
export interface TransactionRecord { id: string; kind: TransactionKind; key: string; startedAt: number; finishedAt?: number; status: "started" | "complete" | "failed"; error?: string; }

export class StorageTransactionLog {
  private records: TransactionRecord[] = [];
  start(kind: TransactionKind, key: string, now = Date.now()): string { const id = `tx_${now.toString(36)}_${this.records.length}`; this.records.push({ id, kind, key, startedAt: now, status: "started" }); return id; }
  complete(id: string, now = Date.now()): void { const row = this.records.find((r) => r.id === id); if (row) { row.status = "complete"; row.finishedAt = now; } }
  fail(id: string, error: string, now = Date.now()): void { const row = this.records.find((r) => r.id === id); if (row) { row.status = "failed"; row.finishedAt = now; row.error = error.slice(0, 240); } }
  tail(limit = 20): TransactionRecord[] { return this.records.slice(-Math.max(1, Math.min(limit, 100))).map((r) => ({ ...r })); }
}
