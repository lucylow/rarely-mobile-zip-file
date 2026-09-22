import { sleep, makeId } from './mock';
import type { DocumentResult } from './types';

export interface NutrientPort { createStyleBook(payload: Record<string, unknown>): Promise<DocumentResult>; }

export class MockNutrientAdapter implements NutrientPort {
  async createStyleBook(payload: Record<string, unknown>): Promise<DocumentResult> {
    await sleep(520);
    void payload;
    return { id: makeId('nutrient'), status: 'complete', downloadUrl: 'https://example.com/mock/rarely-style-book.pdf', pages: 6, provider: 'Nutrient demo adapter' };
  }
}

export const nutrient = new MockNutrientAdapter();
