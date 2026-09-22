import { describe, expect, it } from 'vitest';
import { migrate } from '../../src/release/v2/storage/migration';
import { canWrite } from '../../src/release/v2/storage/quota';
describe('storage safeguards', () => { it('migrates versions', () => expect(migrate({ value: 1 }, 1, [{ from: 1, to: 2, up: (x) => ({ value: x.value + 1 }) }], 2).value.value).toBe(2)); it('blocks writes beyond quota', () => expect(canWrite({ maxBytes: 10, usedBytes: 9 }, 2)).toBe(false)); });
