import { describe, expect, it } from 'vitest';
import { batch } from '../../src/release/v2/sync/batch';
import { resolveConflict } from '../../src/release/v2/sync/conflictPolicy';
describe('sync v2', () => { it('batches records', () => expect(batch([1,2,3,4,5], 2)).toEqual([[1,2],[3,4],[5]])); it('selects newer timestamp', () => expect(resolveConflict({ id:'x', updatedAt: 2, version: 2 }, { id:'x', updatedAt: 1, version: 1 })).toBe('local')); });
