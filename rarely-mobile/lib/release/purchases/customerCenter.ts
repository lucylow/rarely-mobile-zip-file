export interface CustomerCenterGateway { present(): Promise<void>; }

export async function openCustomerCenter(gateway: CustomerCenterGateway): Promise<{ ok: true } | { ok: false; message: string }> {
  try { await gateway.present(); return { ok: true }; }
  catch (error) { return { ok: false, message: error instanceof Error ? error.message : "Customer Center unavailable" }; }
}
