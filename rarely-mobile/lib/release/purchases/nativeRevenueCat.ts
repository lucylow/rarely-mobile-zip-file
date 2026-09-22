/*
 * Native adapter. Install with:
 *   npx expo install react-native-purchases react-native-purchases-ui
 * and use a development/EAS build for native testing.
 */
import { Platform } from "react-native";
import Purchases from "react-native-purchases";
import { APPLE_PRODUCTS, RARELY_ENTITLEMENTS } from "./productIds";
import type { EntitlementSnapshot, StoreOffering, StorePackage } from "./types";

const API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_APPLE_KEY ?? "";

export async function configureRevenueCat(appUserId?: string): Promise<void> {
  if (Platform.OS !== "ios") return;
  if (!API_KEY) throw new Error("EXPO_PUBLIC_REVENUECAT_APPLE_KEY is not configured");
  await Purchases.configure({ apiKey: API_KEY, appUserID: appUserId });
}

function toPackage(value: any): StorePackage {
  return {
    id: String(value.identifier),
    identifier: String(value.identifier),
    productIdentifier: String(value.product?.identifier ?? ""),
    title: String(value.product?.title ?? "RARELY Plus"),
    description: String(value.product?.description ?? "More creative room."),
    priceString: String(value.product?.priceString ?? ""),
    currencyCode: String(value.product?.currencyCode ?? ""),
    period: value.product?.subscriptionPeriod ? String(value.product.subscriptionPeriod) : undefined,
  };
}

function toEntitlement(info: any): EntitlementSnapshot {
  const item = info?.entitlements?.active?.[RARELY_ENTITLEMENTS.plus] ?? info?.entitlements?.all?.[RARELY_ENTITLEMENTS.plus];
  return {
    id: RARELY_ENTITLEMENTS.plus,
    active: Boolean(item?.isActive),
    willRenew: Boolean(item?.willRenew),
    productIdentifier: item?.productIdentifier,
    expirationDate: item?.expirationDate,
    source: "store",
    checkedAt: new Date().toISOString(),
  };
}

let configurationPromise: Promise<void> | undefined;

async function ensureConfigured(): Promise<void> {
  if (!configurationPromise) configurationPromise = configureRevenueCat();
  await configurationPromise;
}

export function createRevenueCatGateway() {
  return {
    async getOffering(): Promise<StoreOffering | undefined> {
      await ensureConfigured();
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return undefined;
      return { identifier: current.identifier, serverDescription: current.serverDescription, availablePackages: current.availablePackages.map(toPackage) };
    },
    async purchase(pkg: StorePackage): Promise<EntitlementSnapshot> {
      await ensureConfigured();
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      const actual = current?.availablePackages.find((candidate: any) => candidate.identifier === pkg.identifier || candidate.product?.identifier === pkg.productIdentifier);
      if (!actual) throw new Error(`Package ${pkg.productIdentifier} is unavailable`);
      const result = await Purchases.purchasePackage(actual);
      return toEntitlement(result.customerInfo);
    },
    async restore(): Promise<EntitlementSnapshot | undefined> {
      await ensureConfigured();
      const info = await Purchases.restorePurchases();
      return toEntitlement(info);
    },
    async refresh(): Promise<EntitlementSnapshot | undefined> {
      await ensureConfigured();
      const info = await Purchases.getCustomerInfo();
      return toEntitlement(info);
    },
  };
}

export const DEBUG_PRODUCT_IDS = APPLE_PRODUCTS;
