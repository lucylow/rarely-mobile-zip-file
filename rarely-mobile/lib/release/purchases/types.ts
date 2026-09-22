export type PurchaseState = "idle" | "loading-offerings" | "ready" | "purchasing" | "restoring" | "synced" | "error";

export interface StorePackage {
  id: string;
  identifier: string;
  productIdentifier: string;
  title: string;
  description: string;
  priceString: string;
  currencyCode: string;
  period?: string;
}

export interface StoreOffering {
  identifier: string;
  serverDescription?: string;
  availablePackages: StorePackage[];
}

export interface EntitlementSnapshot {
  id: string;
  active: boolean;
  willRenew: boolean;
  productIdentifier?: string;
  expirationDate?: string;
  source: "store" | "cache" | "mock" | "unknown";
  checkedAt: string;
}

export interface PurchaseSession {
  state: PurchaseState;
  offering?: StoreOffering;
  entitlement?: EntitlementSnapshot;
  errorCode?: string;
  lastAction?: "purchase" | "restore" | "refresh";
}
