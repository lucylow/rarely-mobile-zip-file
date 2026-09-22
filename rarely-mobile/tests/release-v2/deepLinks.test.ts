import { describe, expect, it } from 'vitest';
import { parseDeepLink } from '../../src/release/v2/deepLinks/parser';
import { isSafeDeepLink } from '../../src/release/v2/deepLinks/security';

describe('deep links', () => {
  it('parses a moment route', () => expect(parseDeepLink('rarely://moment/m123').kind).toBe('moment'));
  it('blocks unsafe schemes', () => expect(isSafeDeepLink('javascript:alert(1)')).toBe(false));
});
