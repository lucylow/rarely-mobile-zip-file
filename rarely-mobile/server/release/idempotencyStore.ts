export class InMemoryWebhookIdempotency {
  private readonly ids = new Set<string>();
  has(id: string): boolean { return this.ids.has(id); }
  remember(id: string): void { this.ids.add(id); }
  clear(): void { this.ids.clear(); }
}
