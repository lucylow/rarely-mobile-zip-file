import { MOCK_CUSTOMER_INFO, MOCK_OFFERINGS } from "../mocks/purchases";
import { APPLE_PRODUCTS, RARELY_ENTITLEMENTS } from "./productIds";
import type { EntitlementSnapshot, StoreOffering } from "./types";

export class MockPurchaseGateway {
  mode: "success" | "cancel" | "pending" | "failure" = "success";

  async getOffering(): Promise<StoreOffering> {
    const current = MOCK_OFFERINGS[0];
    return {
      identifier: current.id,
      availablePackages: current.packages.map((item) => ({
        id: item.id,
        identifier: item.identifier,
        productIdentifier: item.identifier,
        title: `RARELY Plus ${item.id}`,
        description: `Mock ${item.id} membership`,
        priceString: item.priceString,
        currencyCode: item.currency,
        period: item.period,
      })),
    };
  }

  async purchase(pkg: { productIdentifier: string }): Promise<EntitlementSnapshot> {
    if (this.mode === "cancel") throw Object.assign(new Error("User cancelled"), { code: "PURCHASE_CANCELLED" });
    if (this.mode === "pending") throw Object.assign(new Error("Purchase pending"), { code: "PURCHASE_PENDING" });
    if (this.mode === "failure") throw Object.assign(new Error("Store error"), { code: "PURCHASE_FAILED" });
    return { id: RARELY_ENTITLEMENTS.plus, active: true, willRenew: true, productIdentifier: pkg.productIdentifier, expirationDate: new Date(Date.now()+30*86400000).toISOString(), source: "mock", checkedAt: new Date().toISOString() };
  }

  async restore(): Promise<EntitlementSnapshot> {
    return { id: RARELY_ENTITLEMENTS.plus, active: true, willRenew: true, productIdentifier: MOCK_CUSTOMER_INFO.activeSubscriptions[0] ?? APPLE_PRODUCTS.monthly, expirationDate: new Date(Date.now()+30*86400000).toISOString(), source: "mock", checkedAt: new Date().toISOString() };
  }

  async refresh(): Promise<EntitlementSnapshot> { return this.restore(); }
}
