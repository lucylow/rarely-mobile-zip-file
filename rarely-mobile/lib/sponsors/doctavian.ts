import { sleep, makeId } from './mock';
import type { DocumentResult } from './types';

export interface DoctavianPort { generateStructuredDocument(payload: Record<string, unknown>): Promise<DocumentResult>; }

export class MockDoctavianAdapter implements DoctavianPort {
  async generateStructuredDocument(payload: Record<string, unknown>): Promise<DocumentResult> {
    await sleep(460);
    void payload;
    return { id: makeId('doctavian'), status: 'complete', downloadUrl: 'https://example.com/mock/doctavian-document.pdf', pages: 4, provider: 'Doctavian demo adapter' };
  }
}

export const doctavian = new MockDoctavianAdapter();
