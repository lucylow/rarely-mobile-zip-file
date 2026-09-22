export class BlockList {
  private readonly ids = new Set<string>();

  add(userId: string): void { if (userId.trim()) this.ids.add(userId); }
  remove(userId: string): void { this.ids.delete(userId); }
  has(userId: string): boolean { return this.ids.has(userId); }
  size(): number { return this.ids.size; }
  toArray(): string[] { return [...this.ids].sort(); }
}
