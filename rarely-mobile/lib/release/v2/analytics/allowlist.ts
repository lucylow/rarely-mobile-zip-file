import type { AnalyticsEventName } from './schema';
export const EVENT_ALLOWLIST: readonly AnalyticsEventName[] = ['app_opened','moment_started','moment_completed','journal_saved','routine_completed','membership_viewed','purchase_started','purchase_completed','purchase_failed','permission_requested','error_seen'];
export function allowedEvent(name: string): name is AnalyticsEventName { return (EVENT_ALLOWLIST as readonly string[]).includes(name); }
