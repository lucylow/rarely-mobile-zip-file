export type UpgradeActivityKind =
  | "mood.checked"
  | "moment.viewed"
  | "moment.completed"
  | "moment.saved"
  | "moment.dismissed"
  | "journal.started"
  | "journal.saved"
  | "journal.deleted"
  | "create.started"
  | "create.completed"
  | "circle.joined"
  | "circle.left"
  | "circle.posted"
  | "circle.reacted"
  | "routine.started"
  | "routine.completed"
  | "routine.skipped"
  | "scrapbook.opened"
  | "memory.accepted"
  | "memory.rejected"
  | "memory.deleted"
  | "recommendation.fitted"
  | "recommendation.rejected"
  | "backup.exported"
  | "backup.imported"
  | "sync.completed"
  | "notification.opened"
  | "ai.sparked"
  | "ai.reflected"
  | "ai.played";

export type ActivitySource =
  | "home"
  | "create"
  | "community"
  | "studio"
  | "profile"
  | "journal"
  | "scrapbook"
  | "system";

export type PrivacyClass =
  | "public"
  | "personal"
  | "private-journal"
  | "secret-like";

export type MemoryKind =
  | "interest"
  | "creative-medium"
  | "routine"
  | "time-pattern"
  | "community"
  | "preference";

export type NotificationKind =
  | "daily-brief"
  | "ritual"
  | "reflection"
  | "community-challenge"
  | "streak";

export type AiMode = "Spark" | "Reflect" | "Play";

export interface ActivityEvent<T = Record<string, unknown>> {
  id: string;
  kind: UpgradeActivityKind;
  source: ActivitySource;
  occurredAt: string;
  deviceId: string;
  sessionId: string;
  privacy: PrivacyClass;
  title?: string;
  metadata: T;
  schemaVersion: number;
}

export interface ActivityDraft<T = Record<string, unknown>> {
  kind: UpgradeActivityKind;
  source: ActivitySource;
  occurredAt?: string;
  privacy?: PrivacyClass;
  title?: string;
  metadata: T;
}

export interface EventCursor {
  sequence: number;
  eventId: string;
}

export interface SyncEvent {
  id: string;
  sequence: number;
  kind: UpgradeActivityKind;
  occurredAt: string;
  source: ActivitySource;
  privacy: PrivacyClass;
  title?: string;
  metadata: Record<string, unknown>;
}

export interface SyncBatch {
  deviceId: string;
  cursor: EventCursor | null;
  events: SyncEvent[];
  clientTime: string;
  schemaVersion: number;
}

export interface SyncAck {
  accepted: string[];
  rejected: Array<{ id: string; reason: string }>;
  serverCursor: EventCursor | null;
}

export interface MemoryEvidence {
  eventId: string;
  kind: UpgradeActivityKind;
  weight: number;
  occurredAt: string;
}

export interface MemoryItem {
  id: string;
  key: string;
  kind: MemoryKind;
  label: string;
  value: string;
  confidence: number;
  firstSeenAt: string;
  lastSeenAt: string;
  evidence: MemoryEvidence[];
  editable: boolean;
  source: "explicit" | "inferred";
  explanation: string;
}

export interface MemoryCandidate {
  key: string;
  kind: MemoryKind;
  label: string;
  value: string;
  weight: number;
  evidence: MemoryEvidence[];
  explanation: string;
}

export interface Insight {
  id: string;
  title: string;
  summary: string;
  metric: number;
  unit: string;
  periodLabel: string;
  evidence: string[];
  action?: {
    label: string;
    kind: "moment" | "routine" | "journal" | "circle";
  };
}

export interface DailyBriefItem {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  kind: "ritual" | "creative" | "reflection" | "community";
  reason: string;
}

export interface DailyBrief {
  date: string;
  greeting: string;
  theme: string;
  items: DailyBriefItem[];
  footer: string;
}

export interface RoutineDefinition {
  id: string;
  name: string;
  description: string;
  days: number[];
  durationMinutes: number;
  steps: string[];
  tags: string[];
}

export interface RoutineState {
  routineId: string;
  startedCount: number;
  completedCount: number;
  skippedCount: number;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  bestStreak: number;
  currentStreak: number;
}

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  rollout?: number;
  killSwitch?: boolean;
}

export interface FeatureFlagSnapshot {
  userKey: string;
  generatedAt: string;
  flags: Record<string, boolean>;
}

export interface TelemetryEvent {
  name: string;
  occurredAt: string;
  properties: Record<string, string | number | boolean>;
}

export interface BackupEnvelope {
  format: "rarely-backup";
  version: 1;
  exportedAt: string;
  appVersion?: string;
  deviceId: string;
  data: {
    activities: ActivityEvent[];
    memories: MemoryItem[];
    routines: RoutineState[];
    preferences: Record<string, unknown>;
  };
  integrity: {
    algorithm: "sha256";
    checksum: string;
  };
}
