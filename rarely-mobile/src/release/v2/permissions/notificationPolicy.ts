export type NotificationKind = 'routine' | 'weekly-reflection' | 'gentle-return' | 'purchase';

export interface NotificationPreferences {
  enabled: boolean;
  quietStartHour: number;
  quietEndHour: number;
  kinds: Partial<Record<NotificationKind, boolean>>;
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enabled: false,
  quietStartHour: 22,
  quietEndHour: 8,
  kinds: {
    routine: true,
    'weekly-reflection': true,
    'gentle-return': false,
    purchase: false,
  },
};

export function isQuietHour(hour: number, prefs: NotificationPreferences): boolean {
  const start = prefs.quietStartHour;
  const end = prefs.quietEndHour;
  if (start === end) return false;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

export function shouldSchedule(kind: NotificationKind, hour: number, prefs: NotificationPreferences): boolean {
  return prefs.enabled && prefs.kinds[kind] !== false && !isQuietHour(hour, prefs);
}
