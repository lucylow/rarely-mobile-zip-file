import { describe, expect, it } from 'vitest';
import { isRetryableStatus, retryAfterMs } from '../../src/release/v2/network/httpPolicy';
describe('network policy', () => { it('retries 429/5xx', () => { expect(isRetryableStatus(429)).toBe(true); expect(isRetryableStatus(503)).toBe(true); }); it('parses retry-after', () => { expect(retryAfterMs({ 'retry-after': '2' })).toBe(2000); }); });
