import type { UpgradeActivityKind } from "./types";

export interface PrivacyAuditEntry {
  at: string;
  action: "sync" | "ai" | "backup" | "export" | "delete";
  kind?: UpgradeActivityKind;
  allowed: boolean;
  reason: string;
}

export class PrivacyAuditLog {
  private readonly entries: PrivacyAuditEntry[] = [];

  add(entry: Omit<PrivacyAuditEntry, "at">, now = new Date()): void {
    this.entries.push({ ...entry, at: now.toISOString() });
    if (this.entries.length > 200) this.entries.splice(0, this.entries.length - 200);
  }

  list(): PrivacyAuditEntry[] { return [...this.entries]; }
  deniedCount(action?: PrivacyAuditEntry["action"]): number { return this.entries.filter((entry) => !entry.allowed && (!action || entry.action === action)).length; }
  lastDenied(action?: PrivacyAuditEntry["action"]): PrivacyAuditEntry | null { return [...this.entries].reverse().find((entry) => !entry.allowed && (!action || entry.action === action)) ?? null; }
}
