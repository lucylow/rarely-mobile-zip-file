export function redactPurchasePayload(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  const source = input as Record<string, unknown>;
  const forbidden = new Set(["receipt", "signedTransactionInfo", "signedRenewalInfo", "transactionReceipt", "appAccountToken", "originalTransactionIdentifier"]);
  return Object.fromEntries(Object.entries(source).filter(([key]) => !forbidden.has(key)).map(([key, value]) => [key, typeof value === "string" && value.length > 160 ? `${value.slice(0, 24)}…` : value]));
}
