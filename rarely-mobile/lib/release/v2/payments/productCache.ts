import type { StoreProduct } from '../storeKit/gateway';
export interface ProductCache { fetchedAt: number; items: StoreProduct[]; }
export function cacheFresh(cache: ProductCache | undefined, now = Date.now(), maxAgeMs = 15 * 60_000): boolean { return !!cache && now - cache.fetchedAt <= maxAgeMs; }
export function mergeProducts(previous: StoreProduct[] | undefined, incoming: StoreProduct[]): StoreProduct[] { const map = new Map<string, StoreProduct>(); for (const item of previous ?? []) map.set(item.identifier, item); for (const item of incoming) map.set(item.identifier, item); return [...map.values()]; }
