import type { EntitlementSnapshot } from '../payments/entitlements';

export interface StoreProduct {
  identifier: string;
  priceString: string;
  title: string;
  description: string;
}

export interface StoreKitGateway {
  configure(appUserId?: string): Promise<void>;
  getProducts(ids: string[]): Promise<StoreProduct[]>;
  purchase(productId: string): Promise<EntitlementSnapshot>;
  restore(): Promise<EntitlementSnapshot>;
  presentManageSubscriptions(): Promise<void>;
  logOut(): Promise<void>;
}
