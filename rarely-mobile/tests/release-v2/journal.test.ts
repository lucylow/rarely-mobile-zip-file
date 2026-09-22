import { describe, expect, it } from 'vitest';
import { parseRecovery } from '../../src/release/v2/journal/recovery';
import { searchJournal, indexJournal } from '../../src/release/v2/journal/searchIndex';

describe('journal recovery', () => {
  it('identifies malformed data', () => expect(parseRecovery('{')).toEqual({ state: 'malformed' }));
  it('indexes and searches text locally', () => {
    const record = indexJournal({ id: 'j1', title: 'Blue hour', body: 'I noticed blue light', createdAt: 1, updatedAt: 1, archived: false, version: 1 });
    expect(searchJournal([record], 'blue')).toHaveLength(1);
  });
});
