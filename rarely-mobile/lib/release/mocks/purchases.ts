export const MOCK_OFFERINGS = [
  { id: "default", title: "RARELY Plus", packages: [
    { id: "monthly", identifier: "rarely.plus.monthly", period: "P1M", priceString: "$6.99", price: 6.99, currency: "USD" },
    { id: "annual", identifier: "rarely.plus.annual", period: "P1Y", priceString: "$49.99", price: 49.99, currency: "USD" },
  ]},
] as const;

export const MOCK_CUSTOMER_INFO = {
  originalAppUserId: "mock-user-001",
  activeEntitlements: { rarely_plus: { identifier: "rarely_plus", isActive: true, willRenew: true, productIdentifier: "rarely.plus.monthly", expirationDate: "2026-10-22T00:00:00.000Z" } },
  activeSubscriptions: ["rarely.plus.monthly"],
};

export const MOCK_PURCHASE_FAILURES = [
  "cancelled", "network", "pending", "store-unavailable", "already-owned", "unknown"
] as const;
