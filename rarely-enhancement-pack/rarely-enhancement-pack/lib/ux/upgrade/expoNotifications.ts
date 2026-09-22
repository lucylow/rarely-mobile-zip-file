import * as Notifications from "expo-notifications";
import type { NotificationPermissionAdapter, NotificationSchedulerAdapter } from "./notifications";

export const expoNotificationPermission: NotificationPermissionAdapter = {
  async request() {
    const current = await Notifications.getPermissionsAsync();
    if (current.status === "granted") return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted";
  },
};

export const expoNotificationScheduler: NotificationSchedulerAdapter = {
  async cancelAll() { await Notifications.cancelAllScheduledNotificationsAsync(); },
  async schedule({ title, body, fireAt, data }) {
    return Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: fireAt } });
  },
};
