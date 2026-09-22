import { createRevenueCatGateway } from "./nativeRevenueCat";
import { MockPurchaseGateway } from "./mockGateway";

export function shouldUseReleaseMocks(): boolean {
  return typeof __DEV__ !== "undefined" && __DEV__ && String(process.env.EXPO_PUBLIC_RARELY_ENABLE_MOCKS).toLowerCase() === "true";
}

export function createReleasePurchaseGateway() {
  return shouldUseReleaseMocks() ? new MockPurchaseGateway() : createRevenueCatGateway();
}
