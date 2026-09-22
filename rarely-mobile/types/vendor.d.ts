declare module "zod" { export const z: any; }
declare module "react" { export type ReactNode = any; const React: any; export default React; }
declare module "react-native" { export const View:any, Text:any, ScrollView:any, Pressable:any, ActivityIndicator:any, Modal:any, Switch:any, Platform:any; }
declare module "react-native-purchases" { const Purchases: any; export default Purchases; }
declare module "react-native-purchases-ui" { export const presentCustomerCenter: any; }
declare namespace JSX { interface IntrinsicElements { [elemName: string]: any; } }
declare const __DEV__: boolean;
declare const HermesInternal: unknown;
declare module "node:crypto" { const crypto: any; export default crypto; export function createHmac(...args: any[]): any; export function timingSafeEqual(...args: any[]): boolean; }
declare const Buffer: any;
declare module "vitest" { export const describe: any; export const expect: any; export const it: any; }

declare const process: any;
