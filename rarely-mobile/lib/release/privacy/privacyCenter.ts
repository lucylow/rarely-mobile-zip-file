import type { ConsentState } from "./consent";

export interface PrivacyRow {
  id: string;
  title: string;
  detail: string;
  enabled: boolean;
  optional: boolean;
}

export function privacyRows(consent: ConsentState): PrivacyRow[] {
  return [
    { id: "aiCreative", title: "Creative AI", detail: "Allow the creative tool to use the prompt you submit.", enabled: consent.aiCreative, optional: true },
    { id: "personalizedNotifications", title: "Personal reminders", detail: "Use your selected interests and routine choices to shape reminders.", enabled: consent.personalizedNotifications, optional: true },
    { id: "optionalAnalytics", title: "Optional analytics", detail: "Share limited, redacted product diagnostics.", enabled: consent.optionalAnalytics, optional: true },
    { id: "cloudSync", title: "Cloud continuity", detail: "Sync selected non-private activity across devices.", enabled: consent.cloudSync, optional: true },
  ];
}
