import { sleep, makeId } from './mock';
import type { DocumentResult } from './types';

export interface FoxitPort { buildPdfWorkflow(payload: Record<string, unknown>): Promise<DocumentResult>; }

export class MockFoxitAdapter implements FoxitPort {
  async buildPdfWorkflow(payload: Record<string, unknown>): Promise<DocumentResult> {
    await sleep(430);
    void payload;
    return { id: makeId('foxit'), status: 'complete', downloadUrl: 'https://example.com/mock/foxit-review.pdf', pages: 3, provider: 'Foxit demo adapter' };
  }
}

export const foxit = new MockFoxitAdapter();
