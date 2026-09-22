import { ReleaseError } from "../errors/ReleaseError";
import { SyncOutbox } from "./outbox";
import type { SyncEvent } from "./types";

export interface SyncTransport<T> {
  push(events: SyncEvent<T>[]): Promise<{ acknowledged: string[]; remote: SyncEvent<T>[] }>;
}

export class SyncEngine<T> {
  readonly outbox = new SyncOutbox<T>();
  private state: "idle" | "syncing" | "offline" | "failed" = "idle";
  constructor(private readonly transport: SyncTransport<T>) {}
  get snapshot() { return { state: this.state, pending: this.outbox.size() }; }
  queue(event: SyncEvent<T>): void { this.outbox.enqueue(event); }
  async flush(): Promise<{ acknowledged: string[]; remote: SyncEvent<T>[] }> {
    if (!this.outbox.size()) return { acknowledged: [], remote: [] };
    this.state = "syncing";
    try { const batch = this.outbox.next(); const result = await this.transport.push(batch); this.outbox.acknowledge(result.acknowledged); this.state = "idle"; return result; }
    catch (error) { this.state = "failed"; if (error instanceof TypeError) this.state = "offline"; throw new ReleaseError({ code: this.state === "offline" ? "NETWORK_OFFLINE" : "SYNC_TEMPORARY", message: error instanceof Error ? error.message : String(error), retryable: true, recovery: "TRY_LATER" }); }
  }
}
