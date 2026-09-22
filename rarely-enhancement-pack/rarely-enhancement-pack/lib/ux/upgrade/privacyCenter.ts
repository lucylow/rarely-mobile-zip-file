import type { ActivityEvent, PrivacyClass } from "./types";

export interface PrivacySettings {
  syncPersonalEvents: boolean;
  syncPrivateJournals: boolean;
  diagnosticsEnabled: boolean;
  notificationsEnabled: boolean;
  aiConsent: boolean;
  communityPreflightEnabled: boolean;
  shareScrapbookByDefault: boolean;
}

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  syncPersonalEvents: true,
  syncPrivateJournals: false,
  diagnosticsEnabled: false,
  notificationsEnabled: true,
  aiConsent: false,
  communityPreflightEnabled: true,
  shareScrapbookByDefault: false,
};

export class PrivacyCenter {
  constructor(private readonly settings: PrivacySettings = DEFAULT_PRIVACY_SETTINGS) {}

  canSync(event: ActivityEvent): boolean {
    if (event.privacy === "secret-like") return false;
    if (event.privacy === "private-journal") return this.settings.syncPrivateJournals;
    if (event.privacy === "personal") return this.settings.syncPersonalEvents;
    return this.settings.syncPersonalEvents;
  }

  canUseAi(): boolean {
    return this.settings.aiConsent;
  }

  canSendDiagnostics(): boolean {
    return this.settings.diagnosticsEnabled;
  }

  canScheduleNotifications(): boolean {
    return this.settings.notificationsEnabled;
  }

  shouldTreatAsPrivate(kind: ActivityEvent["kind"]): boolean {
    return kind === "journal.started" || kind === "journal.saved" || kind === "journal.deleted";
  }

  classifyActivity(kind: ActivityEvent["kind"], explicitlyPrivate = false): PrivacyClass {
    if (explicitlyPrivate || this.shouldTreatAsPrivate(kind)) return "private-journal";
    if (
      kind === "mood.checked" ||
      kind === "moment.saved" ||
      kind === "moment.completed" ||
      kind === "routine.completed" ||
      kind === "recommendation.fitted" ||
      kind === "recommendation.rejected"
    ) return "personal";
    return "public";
  }

  getSettings(): PrivacySettings {
    return { ...this.settings };
  }

  describeSyncPolicy(event: ActivityEvent): string {
    if (event.privacy === "secret-like") return "Never sync secret-like data.";
    if (event.privacy === "private-journal" && !this.settings.syncPrivateJournals) {
      return "Private journal activity stays on this device.";
    }
    if (event.privacy === "personal" && !this.settings.syncPersonalEvents) {
      return "Personal activity sync is disabled.";
    }
    return "This event is eligible for controlled synchronization.";
  }
}

export function stripPrivateFields(metadata: Record<string, unknown>): Record<string, unknown> {
  const blocked = new Set([
    "text", "body", "content", "journalText", "privateNote", "imageUri", "imageUris", "secret", "password", "token",
  ]);
  const output: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (blocked.has(key)) continue;
    if (Array.isArray(value)) {
      output[key] = value.filter((entry) => typeof entry !== "string" || entry.length < 256);
      continue;
    }
    if (typeof value === "object" && value !== null) {
      output[key] = stripPrivateFields(value as Record<string, unknown>);
      continue;
    }
    output[key] = value;
  }
  return output;
}
