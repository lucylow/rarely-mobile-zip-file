export type ProductAvailability = { productId: string; storefront: string; available: boolean; price: string; currency: string; reason?: string };
export function selectProducts(items: ProductAvailability[], storefront: string): ProductAvailability[] {
  return items.filter((x) => x.storefront === storefront && x.available && x.price && x.currency).sort((a,b) => a.productId.localeCompare(b.productId));
}
export function missingProducts(expected: string[], available: ProductAvailability[]): string[] {
  const set = new Set(available.filter((x) => x.available).map((x) => x.productId));
  return expected.filter((x) => !set.has(x));
}
export function fallbackPrice(productId: string): ProductAvailability { return { productId, storefront: 'fallback', available: false, price: '', currency: '', reason: 'store-product-unavailable' }; }
