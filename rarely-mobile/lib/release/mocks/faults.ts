export const MOCK_FAULTS = {
  network: [
    { id: "offline", code: "NETWORK_OFFLINE", description: "navigator unavailable" },
    { id: "timeout", code: "NETWORK_TIMEOUT", description: "request exceeds timeout" },
    { id: "429", code: "NETWORK_RATE_LIMITED", description: "server throttles request" },
    { id: "500", code: "NETWORK_SERVER", description: "unexpected server response" },
  ],
  storage: [
    { id: "missing", code: "STORAGE_UNAVAILABLE", description: "getItem throws" },
    { id: "malformed", code: "STORAGE_MALFORMED", description: "invalid JSON" },
    { id: "quota", code: "STORAGE_QUOTA", description: "setItem fails due to capacity" },
  ],
  purchase: [
    { id: "cancelled", code: "PURCHASE_CANCELLED", description: "user dismisses Apple sheet" },
    { id: "pending", code: "PURCHASE_PENDING", description: "Apple marks transaction pending" },
    { id: "restore-failed", code: "ENTITLEMENT_SYNC_FAILED", description: "restore cannot reach service" },
  ],
} as const;
