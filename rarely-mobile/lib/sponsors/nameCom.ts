import { sleep } from "./mock";
import type { DomainResult } from "./types";

export interface NameComPort { checkDomain(domain: string): Promise<DomainResult>; searchDomains(seed: string): Promise<DomainResult[]>; }

export class MockNameComAdapter implements NameComPort {
  async checkDomain(domain: string): Promise<DomainResult> {
    await sleep(420);
    const normalized = domain.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/-+/g, "-");
    return { domain: normalized, available: !normalized.includes("already"), status: "complete", provider: "name.com · offline mock availability", meta: { provider: "name-com", mode: "mock", requestId: "demo-namecom-001", durationMs: 420, status: "complete" } };
  }
  async searchDomains(seed: string): Promise<DomainResult[]> {
    const base = seed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "rarely-studio";
    return Promise.all([`${base}.studio`, `${base}.co`, `${base}.journal`, `${base}.world`].map((candidate) => this.checkDomain(candidate)));
  }
}
export const nameCom = new MockNameComAdapter();
