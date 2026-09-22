export interface DeletionRecoveryState { serverDeleted: boolean; localWiped: boolean; purchaseIdentityCleared: boolean; signedOut: boolean; pendingCleanup: string[]; }

export async function deleteWithRecovery(deps: { deleteServer: () => Promise<void>; wipeLocal: () => Promise<void>; clearPurchase: () => Promise<void>; signOut: () => Promise<void>; }): Promise<DeletionRecoveryState> {
  const state: DeletionRecoveryState = { serverDeleted: false, localWiped: false, purchaseIdentityCleared: false, signedOut: false, pendingCleanup: [] };
  await deps.deleteServer();
  state.serverDeleted = true;
  try { await deps.wipeLocal(); state.localWiped = true; } catch { state.pendingCleanup.push("local"); }
  try { await deps.clearPurchase(); state.purchaseIdentityCleared = true; } catch { state.pendingCleanup.push("purchase"); }
  try { await deps.signOut(); state.signedOut = true; } catch { state.pendingCleanup.push("session"); }
  return state;
}
