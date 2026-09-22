import type { EntitlementSnapshot } from '../payments/entitlements';
import type { StoreKitGateway, StoreProduct } from './gateway';

export class DemoStoreKitGateway implements StoreKitGateway {
  private active = false;

  async configure(): Promise<void> {}

  async getProducts(ids: string[]): Promise<StoreProduct[]> {
    return ids.map((identifier) => ({
      identifier,
      priceString: identifier.endsWith('annual') ? '$39.99 / year' : '$4.99 / month',
      title: identifier.endsWith('annual') ? 'RARELY Premium Annual' : 'RARELY Premium Monthly',
      description: 'Expanded creative tools and membership experiences.',
    }));
  }

  async purchase(productId: string): Promise<EntitlementSnapshot> {
    if (!productId) throw new Error('product-missing');
    this.active = true;
    return this.snapshot(productId);
  }

  async restore(): Promise<EntitlementSnapshot> {
    return this.snapshot(this.active ? 'rarely.premium.annual' : undefined);
  }

  async presentManageSubscriptions(): Promise<void> {}

  async logOut(): Promise<void> { this.active = false; }

  private snapshot(productId?: string): EntitlementSnapshot {
    return {
      fetchedAt: Date.now(),
      premium: {
        key: 'premium',
        active: this.active,
        productId,
        source: 'mock',
        updatedAt: Date.now(),
      },
    };
  }
}
