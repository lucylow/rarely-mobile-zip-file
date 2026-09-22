export interface ResourceLease { name: string; expiresAt: number; }
export class ResourceGuard {
  private lease?: ResourceLease;
  constructor(private readonly ttlMs = 15_000) {}
  acquire(name: string, now = Date.now()): ResourceLease {
    if (this.lease && this.lease.expiresAt > now && this.lease.name !== name) throw new Error('resource-busy');
    this.lease = { name, expiresAt: now + this.ttlMs };
    return this.lease;
  }
  release(name: string): void { if (this.lease?.name === name) this.lease = undefined; }
  isHeld(now = Date.now()): boolean { return !!this.lease && this.lease.expiresAt > now; }
}
