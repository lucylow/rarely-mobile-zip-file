export type SignedTransaction = { transactionId: string; originalTransactionId: string; productId: string; environment: 'Sandbox'|'Production'; expiresAt?: number; revocationDate?: number };
export type VerificationResult = { valid: boolean; transaction?: SignedTransaction; reason?: string };
export function verifyTransaction(transaction: SignedTransaction, expectedProductIds: Set<string>, environment: 'Sandbox'|'Production'): VerificationResult {
  if (!transaction.transactionId || !transaction.originalTransactionId) return { valid: false, reason: 'transaction-id-missing' };
  if (!expectedProductIds.has(transaction.productId)) return { valid: false, reason: 'unknown-product' };
  if (transaction.environment !== environment) return { valid: false, reason: 'environment-mismatch' };
  if (transaction.revocationDate) return { valid: false, reason: 'revoked' };
  if (transaction.expiresAt !== undefined && transaction.expiresAt <= Date.now()) return { valid: false, reason: 'expired' };
  return { valid: true, transaction };
}
export function dedupeKey(transaction: SignedTransaction): string { return `${transaction.environment}:${transaction.originalTransactionId}:${transaction.transactionId}`; }
