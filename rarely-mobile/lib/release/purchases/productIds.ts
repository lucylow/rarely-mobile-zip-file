export const APPLE_PRODUCTS = {
  monthly: "rarely.plus.monthly",
  annual: "rarely.plus.annual",
} as const;

export const RARELY_ENTITLEMENTS = {
  plus: "rarely_plus",
} as const;

export type AppleProductId = typeof APPLE_PRODUCTS[keyof typeof APPLE_PRODUCTS];
export type RarelyEntitlementId = typeof RARELY_ENTITLEMENTS[keyof typeof RARELY_ENTITLEMENTS];

export function isKnownProductId(value: string): value is AppleProductId {
  return Object.values(APPLE_PRODUCTS).includes(value as AppleProductId);
}
