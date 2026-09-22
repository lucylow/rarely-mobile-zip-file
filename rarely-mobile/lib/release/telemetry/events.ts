export type TelemetryEventName =
  | "app_boot"
  | "screen_view"
  | "storage_repaired"
  | "network_failure"
  | "ai_fallback"
  | "purchase_started"
  | "purchase_completed"
  | "purchase_cancelled"
  | "purchase_failed"
  | "restore_started"
  | "restore_completed"
  | "account_delete_started"
  | "account_delete_completed"
  | "sync_degraded"
  | "mock_mode_enabled";

export interface TelemetryEvent {
  name: TelemetryEventName;
  timestamp: string;
  sessionId: string;
  properties?: Record<string, string | number | boolean | null>;
}
