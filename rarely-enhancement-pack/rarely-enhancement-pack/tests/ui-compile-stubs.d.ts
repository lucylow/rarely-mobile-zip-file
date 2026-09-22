declare module "react" {
  export type ReactNode = any;
  export const memo: <T>(component: T) => T;
  export function useMemo<T>(factory: () => T, deps: unknown[]): T;
  export function useEffect(effect: () => void | (() => void), deps?: unknown[]): void;
  export function useState<T>(initial: T): [T, (value: T | ((current: T) => T)) => void];
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: unknown[]): T;
  const React: any;
  export default React;
}
declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
declare module "react-native" {
  export const Pressable: any;
  export const StyleSheet: any;
  export const Text: any;
  export const View: any;
  export const SafeAreaView: any;
  export const ScrollView: any;
  export const Alert: any;
}
declare module "expo-router" {
  export const useRouter: () => { push(route: any): void };
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
