import type { ActivityStore } from "./eventStore";
import type { ActivityEvent } from "./types";

export interface BackfillSourceRecord {
  id: string;
  kind: string;
  source: string;
  occurredAt?: string;
  title?: string;
  metadata?: Record<string, unknown>;
}

export interface BackfillResult {
  imported: number;
  skipped: number;
  unsupported: number;
  errors: string[];
}

const LEGACY_KIND_MAP: Record<string, ActivityEvent["kind"]> = {
  mood: "mood.checked",
  rareMomentCompleted: "moment.completed",
  rareMomentSaved: "moment.saved",
  journal: "journal.saved",
  create: "create.completed",
  circleJoin: "circle.joined",
  routine: "routine.completed",
  feedbackFit: "recommendation.fitted",
  feedbackReject: "recommendation.rejected",
};

export async function backfillLegacyActivity(store: ActivityStore, records: BackfillSourceRecord[]): Promise<BackfillResult> {
  let imported = 0;
  let skipped = 0;
  let unsupported = 0;
  const errors: string[] = [];
  for (const record of records) {
    const kind = LEGACY_KIND_MAP[record.kind];
    if (!kind) { unsupported += 1; continue; }
    if (!record.occurredAt) { skipped += 1; continue; }
    try {
      const existing = store.getEvents({ since: record.occurredAt, until: record.occurredAt });
      if (existing.some((event) => String(event.metadata.legacyId ?? "") === record.id)) { skipped += 1; continue; }
      await store.record({ kind, source: normalizeSource(record.source), occurredAt: record.occurredAt, title: record.title, metadata: { ...(record.metadata ?? {}), legacyId: record.id, backfilled: true } });
      imported += 1;
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "unknown_backfill_error");
    }
  }
  return { imported, skipped, unsupported, errors };
}

function normalizeSource(value: string): ActivityEvent["source"] {
  return ["home", "create", "community", "studio", "profile", "journal", "scrapbook", "system"].includes(value) ? value as ActivityEvent["source"] : "system";
}
