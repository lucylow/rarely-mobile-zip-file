import { redactObject } from '../security/redaction';

export interface Breadcrumb {
  at: number;
  category: string;
  message: string;
  data?: unknown;
}

export class BreadcrumbBuffer {
  private readonly items: Breadcrumb[] = [];
  constructor(private readonly maxItems = 80) {}

  add(category: string, message: string, data?: unknown): void {
    this.items.push({ at: Date.now(), category, message: message.slice(0, 300), data: redactObject(data) });
    while (this.items.length > this.maxItems) this.items.shift();
  }

  snapshot(): Breadcrumb[] {
    return this.items.map((item) => ({ ...item }));
  }
}
