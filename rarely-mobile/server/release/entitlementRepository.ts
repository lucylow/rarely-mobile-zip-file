export interface EntitlementRow {
  userId: string;
  entitlementId: string;
  productId?: string | null;
  active: boolean;
  expiresAtMs?: number | null;
  updatedAt: number;
}

export interface EntitlementRepository {
  findByUser(userId: string): Promise<EntitlementRow[]>;
  upsert(row: EntitlementRow): Promise<void>;
  clearUser(userId: string): Promise<void>;
}

export class InMemoryEntitlementRepository implements EntitlementRepository {
  private readonly rows = new Map<string, EntitlementRow>();
  async findByUser(userId: string): Promise<EntitlementRow[]> { return [...this.rows.values()].filter((row) => row.userId === userId).map((row) => ({ ...row })); }
  async upsert(row: EntitlementRow): Promise<void> { this.rows.set(`${row.userId}:${row.entitlementId}`, { ...row }); }
  async clearUser(userId: string): Promise<void> { for (const [key, row] of this.rows) if (row.userId === userId) this.rows.delete(key); }
}
