export interface SignOutHooks {
  clearSecureSession(): Promise<void>;
  clearLocalAccountData(): Promise<void>;
  clearPendingRequests(): Promise<void>;
  purchaseLogout(): Promise<void>;
}

export async function safeSignOut(hooks: SignOutHooks): Promise<{ cleared: string[]; failures: string[] }> {
  const cleared: string[] = [];
  const failures: string[] = [];
  const tasks: Array<[string, () => Promise<void>]> = [
    ['secure-session', hooks.clearSecureSession],
    ['local-account-data', hooks.clearLocalAccountData],
    ['pending-requests', hooks.clearPendingRequests],
    ['purchase-provider', hooks.purchaseLogout],
  ];
  for (const [name, task] of tasks) {
    try { await task(); cleared.push(name); } catch { failures.push(name); }
  }
  return { cleared, failures };
}
