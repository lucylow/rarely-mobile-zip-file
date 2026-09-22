export type DeleteStep = "preflight" | "server-request" | "local-wipe" | "purchase-signout" | "complete" | "failed";

export interface DeleteProgress { step: DeleteStep; message: string; completed: string[]; }

export interface AccountDeletionDeps {
  deleteServerAccount(): Promise<void>;
  wipeLocalData(): Promise<void>;
  clearPurchaseIdentity(): Promise<void>;
  signOut(): Promise<void>;
}

export async function deleteAccount(deps: AccountDeletionDeps, onProgress?: (progress: DeleteProgress) => void): Promise<void> {
  const completed: string[] = [];
  const report = (step: DeleteStep, message: string) => onProgress?.({ step, message, completed: [...completed] });
  report("preflight", "Preparing account deletion.");
  await deps.deleteServerAccount();
  completed.push("server-account");
  report("server-request", "Account deletion confirmed by the server.");
  await deps.wipeLocalData();
  completed.push("local-data");
  report("local-wipe", "Private local data removed.");
  await deps.clearPurchaseIdentity();
  completed.push("purchase-identity");
  report("purchase-signout", "Membership identity cleared from this device.");
  await deps.signOut();
  completed.push("session");
  report("complete", "Account deleted.");
}
