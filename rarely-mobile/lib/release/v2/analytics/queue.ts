import type { AnalyticsEvent } from './schema';
export class AnalyticsQueue { private readonly items: AnalyticsEvent[] = []; add(event: AnalyticsEvent): void { this.items.push(event); } take(limit = 50): AnalyticsEvent[] { return this.items.splice(0, Math.max(0, limit)); } size(): number { return this.items.length; } clear(): void { this.items.length = 0; } }
