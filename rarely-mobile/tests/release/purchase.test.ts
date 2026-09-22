import { describe, expect, it } from "vitest";
import { PurchaseCoordinator } from "../../lib/release/purchases/purchaseCoordinator";
import { MockPurchaseGateway } from "../../lib/release/purchases/mockGateway";

describe("purchase coordinator", () => {
  it("loads offerings", async () => { const gateway = new MockPurchaseGateway(); const coordinator = new PurchaseCoordinator(gateway); const result = await coordinator.loadOfferings(); expect(result.state).toBe("ready"); expect(result.offering?.availablePackages.length).toBe(2); });
  it("maps cancellation without a destructive error state", async () => { const gateway = new MockPurchaseGateway(); gateway.mode = "cancel"; const coordinator = new PurchaseCoordinator(gateway); await coordinator.loadOfferings(); const pkg = coordinator.snapshot.offering!.availablePackages[0]; const result = await coordinator.purchase(pkg); expect(result.errorCode).toBe("PURCHASE_CANCELLED"); expect(result.state).toBe("ready"); });
  it("restores entitlements", async () => { const gateway = new MockPurchaseGateway(); const coordinator = new PurchaseCoordinator(gateway); const result = await coordinator.restore(); expect(result.entitlement?.active).toBe(true); });
});
