declare module "vitest" {
  export const describe: any;
  export const it: any;
  export const expect: any;
}
declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
  };
  export default AsyncStorage;
}
declare module "expo-notifications" {
  export const SchedulableTriggerInputTypes: { DATE: string };
  export function getPermissionsAsync(): Promise<{ status: string }>;
  export function requestPermissionsAsync(): Promise<{ status: string }>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  export function scheduleNotificationAsync(input: any): Promise<string>;
}
