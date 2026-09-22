export interface PresentedPrice { productId: string; localizedPrice: string; periodLabel: string; }
export function sortPrices(items: PresentedPrice[]): PresentedPrice[] { return [...items].sort((a, b) => a.productId.localeCompare(b.productId)); }
export function annualBadge(item: PresentedPrice): string { return /annual/i.test(item.productId) ? 'Best for a full year' : 'Flexible monthly billing'; }
