import { and, asc, eq, gt, inArray } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { rarelySyncEvents } from "../drizzle/enhancement-schema";

const syncEventSchema = z.object({
  id: z.string().min(8).max(160),
  sequence: z.number().int(),
  kind: z.string().min(1).max(80),
  occurredAt: z.string().datetime(),
  source: z.string().min(1).max(40),
  privacy: z.enum(["public", "personal", "private-journal", "secret-like"]),
  title: z.string().max(160).optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const batchSchema = z.object({
  deviceId: z.string().min(6).max(100),
  cursor: z.object({ sequence: z.number().int(), eventId: z.string() }).nullable().default(null),
  events: z.array(syncEventSchema).max(100),
  clientTime: z.string().datetime(),
  schemaVersion: z.number().int().default(1),
});

export const enhancementRouter = router({
  pushEvents: protectedProcedure.input(batchSchema).mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Database unavailable" });
    const accepted: string[] = [];
    const rejected: Array<{ id: string; reason: string }> = [];
    const safeEvents = input.events.filter((event) => event.privacy !== "secret-like");

    for (const event of safeEvents) {
      try {
        await db.insert(rarelySyncEvents).values({
          userId: ctx.user.id,
          eventId: event.id,
          deviceId: input.deviceId,
          sequence: event.sequence,
          kind: event.kind,
          source: event.source,
          privacy: event.privacy,
          title: event.title ?? null,
          metadataJson: JSON.stringify(stripServerMetadata(event.metadata)),
          occurredAt: new Date(event.occurredAt),
        }).onDuplicateKeyUpdate({ set: { eventId: event.id } });
        accepted.push(event.id);
      } catch {
        rejected.push({ id: event.id, reason: "insert_failed" });
      }
    }

    for (const event of input.events.filter((event) => event.privacy === "secret-like")) rejected.push({ id: event.id, reason: "secret_like_never_sync" });

    const persisted = accepted.length
      ? await db.select({ id: rarelySyncEvents.id, eventId: rarelySyncEvents.eventId }).from(rarelySyncEvents).where(
          and(eq(rarelySyncEvents.userId, ctx.user.id), inArray(rarelySyncEvents.eventId, accepted)),
        ).orderBy(asc(rarelySyncEvents.id))
      : [];
    const lastPersisted = persisted.at(-1);
    const serverCursor = lastPersisted
      ? { sequence: lastPersisted.id, eventId: lastPersisted.eventId }
      : input.cursor;
    return { accepted, rejected, serverCursor };
  }),

  pullEvents: protectedProcedure.input(z.object({ cursor: z.object({ sequence: z.number().int(), eventId: z.string() }).nullable().default(null), limit: z.number().int().min(1).max(100).default(40) })).query(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Database unavailable" });
    const rows = input.cursor
      ? await db.select().from(rarelySyncEvents).where(
          and(
            eq(rarelySyncEvents.userId, ctx.user.id),
            gt(rarelySyncEvents.id, input.cursor.sequence),
          ),
        ).orderBy(asc(rarelySyncEvents.id), asc(rarelySyncEvents.eventId)).limit(input.limit)
      : await db.select().from(rarelySyncEvents).where(eq(rarelySyncEvents.userId, ctx.user.id)).orderBy(asc(rarelySyncEvents.id), asc(rarelySyncEvents.eventId)).limit(input.limit);
    const events = rows.map((row) => ({
      id: row.eventId,
      sequence: row.id,
      kind: row.kind,
      occurredAt: row.occurredAt.toISOString(),
      source: row.source,
      privacy: row.privacy as "public" | "personal" | "private-journal" | "secret-like",
      title: row.title ?? undefined,
      metadata: safeParseJson(row.metadataJson),
    }));
    const last = events.at(-1);
    return { events, cursor: last ? { sequence: last.sequence, eventId: last.id } : input.cursor };
  }),

  deleteAllEvents: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Database unavailable" });
    await db.delete(rarelySyncEvents).where(eq(rarelySyncEvents.userId, ctx.user.id));
    return { deleted: true };
  }),
});

function stripServerMetadata(metadata: Record<string, unknown>): Record<string, unknown> {
  const blocked = new Set(["text", "body", "content", "journalText", "privateNote", "imageUri", "imageUris", "password", "token"]);
  return Object.fromEntries(Object.entries(metadata).filter(([key]) => !blocked.has(key)));
}

function safeParseJson(value: unknown): Record<string, unknown> {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}
