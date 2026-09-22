import { mapPurchaseError } from "./errors";
import type { EntitlementSnapshot, PurchaseSession, StoreOffering, StorePackage } from "./types";

export interface PurchaseGateway {
  getOffering(): Promise<StoreOffering | undefined>;
  purchase(pkg: StorePackage): Promise<EntitlementSnapshot>;
  restore(): Promise<EntitlementSnapshot | undefined>;
  refresh(): Promise<EntitlementSnapshot | undefined>;
}

export class PurchaseCoordinator {
  private session: PurchaseSession = { state: "idle" };
  private lock: Promise<unknown> = Promise.resolve();

  constructor(private readonly gateway: PurchaseGateway) {}

  get snapshot(): PurchaseSession { return { ...this.session, offering: this.session.offering ? { ...this.session.offering, availablePackages: [...this.session.offering.availablePackages] } : undefined }; }

  async loadOfferings(): Promise<PurchaseSession> {
    this.session = { ...this.session, state: "loading-offerings" };
    try {
      const offering = await this.gateway.getOffering();
      this.session = offering ? { ...this.session, state: "ready", offering } : { ...this.session, state: "error", errorCode: "PURCHASE_UNAVAILABLE" };
    } catch (error) {
      const normalized = mapPurchaseError(error);
      this.session = { ...this.session, state: "error", errorCode: normalized.code };
    }
    return this.snapshot;
  }

  async purchase(pkg: StorePackage): Promise<PurchaseSession> {
    return this.serial(async () => {
      this.session = { ...this.session, state: "purchasing", lastAction: "purchase", errorCode: undefined };
      try {
        const entitlement = await this.gateway.purchase(pkg);
        this.session = { ...this.session, state: entitlement.active ? "synced" : "ready", entitlement };
      } catch (error) {
        const normalized = mapPurchaseError(error);
        this.session = { ...this.session, state: normalized.code === "PURCHASE_CANCELLED" ? "ready" : "error", errorCode: normalized.code };
      }
      return this.snapshot;
    });
  }

  async restore(): Promise<PurchaseSession> {
    return this.serial(async () => {
      this.session = { ...this.session, state: "restoring", lastAction: "restore", errorCode: undefined };
      try {
        const entitlement = await this.gateway.restore();
        this.session = { ...this.session, state: "synced", entitlement: entitlement ?? this.session.entitlement };
      } catch (error) {
        const normalized = mapPurchaseError(error);
        this.session = { ...this.session, state: "error", errorCode: normalized.code };
      }
      return this.snapshot;
    });
  }

  async refresh(): Promise<PurchaseSession> {
    return this.serial(async () => {
      try {
        const entitlement = await this.gateway.refresh();
        this.session = { ...this.session, state: "synced", entitlement: entitlement ?? this.session.entitlement, lastAction: "refresh" };
      } catch (error) {
        const normalized = mapPurchaseError(error);
        this.session = { ...this.session, state: "error", errorCode: normalized.code };
      }
      return this.snapshot;
    });
  }

  private async serial<T>(operation: () => Promise<T>): Promise<T> {
    let resolveNext!: () => void;
    const previous = this.lock;
    this.lock = new Promise<void>((resolve) => { resolveNext = resolve; });
    await previous;
    try { return await operation(); } finally { resolveNext(); }
  }
}
