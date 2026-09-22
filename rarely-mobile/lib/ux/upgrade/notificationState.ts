import type { NotificationKind } from "./types";
import type { UpgradeStorage } from "./storage";
import { safeStorageRead, safeStorageWrite } from "./storage";

const KEY = "rarely.upgrade.notification.state";

export interface NotificationState {
  version: 1;
  enabled: boolean;
  lastPermissionCheckAt?: string;
  delivered: Record<string, string>;
}

export class NotificationStateStore {
  private state: NotificationState = { version: 1, enabled: true, delivered: {} };

  constructor(private readonly storage: UpgradeStorage) {}

  async hydrate(): Promise<NotificationState> {
    const result = await safeStorageRead<unknown>(this.storage, KEY);
    if (result.ok && isNotificationState(result.value)) this.state = result.value;
    return { ...this.state, delivered: { ...this.state.delivered } };
  }

  async setEnabled(enabled: boolean): Promise<void> {
    this.state.enabled = enabled;
    await this.persist();
  }

  async rememberScheduled(id: string, kind: NotificationKind, now = new Date()): Promise<void> {
    this.state.delivered[id] = `${kind}:${now.toISOString()}`;
    const entries = Object.entries(this.state.delivered).slice(-200);
    this.state.delivered = Object.fromEntries(entries);
    await this.persist();
  }

  hasScheduled(id: string): boolean { return Boolean(this.state.delivered[id]); }
  getState(): NotificationState { return { ...this.state, delivered: { ...this.state.delivered } }; }

  private async persist(): Promise<void> {
    await safeStorageWrite(this.storage, KEY, this.state);
  }
}

function isNotificationState(value: unknown): value is NotificationState {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return item.version === 1 && typeof item.enabled === "boolean" && typeof item.delivered === "object" && item.delivered !== null;
}
