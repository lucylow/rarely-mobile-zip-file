import type { SyncTransport } from "../lib/ux/upgrade/sync";
import type { EventCursor, SyncBatch, SyncAck, SyncEvent } from "../lib/ux/upgrade/types";

export interface EnhancementClient {
  enhancement: {
    pushEvents: { mutate(input: SyncBatch): Promise<SyncAck> };
    pullEvents: { query(input: { cursor: EventCursor | null; limit: number }): Promise<{ events: SyncEvent[]; cursor: EventCursor | null }> };
  };
}

export function createEnhancementTransport(client: EnhancementClient): SyncTransport {
  return {
    push(batch) { return client.enhancement.pushEvents.mutate(batch); },
    pull(cursor, limit) { return client.enhancement.pullEvents.query({ cursor, limit }); },
  };
}
