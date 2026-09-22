import { DEMO_PRODUCTS, type Product } from "../../data/catalog";
import { sleep } from "./mock";
import type { SearchResult } from "./types";

export interface SerpApiPort { searchShopping(query: string): Promise<SearchResult>; }

export class MockSerpApiAdapter implements SerpApiPort {
  async searchShopping(query: string): Promise<SearchResult> {
    const started = Date.now();
    await sleep(550);
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    const score = (product: Product) => product.tags.filter((tag) => terms.includes(tag)).length + (terms.some((term) => product.title.toLowerCase().includes(term)) ? 1 : 0);
    const products = [...DEMO_PRODUCTS].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id)).slice(0, 8);
    return {
      query,
      products,
      provider: "SerpApi · offline mock catalog",
      meta: { provider: "serpapi", mode: "mock", requestId: "demo-serpapi-001", durationMs: Date.now() - started, status: "complete" },
    };
  }
}
export const serpApi = new MockSerpApiAdapter();
