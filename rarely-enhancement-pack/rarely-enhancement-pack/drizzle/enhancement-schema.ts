import { bigint, datetime, index, int, json, mysqlTable, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

export const rarelySyncEvents = mysqlTable(
  "rarely_sync_events",
  {
    id: bigint("id", { mode: "number", unsigned: true }).autoincrement().primaryKey(),
    userId: int("userId", { unsigned: true }).notNull(),
    eventId: varchar("eventId", { length: 160 }).notNull(),
    deviceId: varchar("deviceId", { length: 100 }).notNull(),
    sequence: bigint("sequence", { mode: "number", unsigned: true }).notNull(),
    kind: varchar("kind", { length: 80 }).notNull(),
    source: varchar("source", { length: 40 }).notNull(),
    privacy: varchar("privacy", { length: 24 }).notNull(),
    title: varchar("title", { length: 160 }),
    metadataJson: json("metadataJson"),
    occurredAt: datetime("occurredAt", { mode: "date" }).notNull(),
  },
  (table) => ({
    userSequence: index("rarely_sync_user_sequence_idx").on(table.userId, table.sequence),
    eventIdUnique: uniqueIndex("rarely_sync_event_id_uidx").on(table.userId, table.eventId),
    occurredAtIndex: index("rarely_sync_occurred_at_idx").on(table.userId, table.occurredAt),
  }),
);
