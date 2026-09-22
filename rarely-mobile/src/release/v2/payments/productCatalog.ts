export type ProductKind = 'subscription';
export type BillingPeriod = 'month' | 'year';

export interface ProductDefinition {
  id: string;
  kind: ProductKind;
  period: BillingPeriod;
  feature: 'premium';
  sortOrder: number;
  requiresAppStoreApproval: boolean;
}

export const PRODUCTS: readonly ProductDefinition[] = [
  { id: 'rarely.premium.monthly', kind: 'subscription', period: 'month', feature: 'premium', sortOrder: 1, requiresAppStoreApproval: true },
  { id: 'rarely.premium.annual', kind: 'subscription', period: 'year', feature: 'premium', sortOrder: 2, requiresAppStoreApproval: true },
];

export function findProduct(id: string): ProductDefinition | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function productIds(): string[] {
  return PRODUCTS.map((product) => product.id);
}
