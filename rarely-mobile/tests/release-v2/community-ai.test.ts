import { describe, expect, it } from 'vitest';
import { moderatePost } from '../../src/release/v2/community/moderation';
import { deterministicFallback, validateAiInput } from '../../src/release/v2/ai';

describe('community and AI', () => {
  it('blocks obvious high-risk content', () => expect(moderatePost('how to make a bomb').decision).toBe('block'));
  it('rejects secret-like AI input', () => expect(validateAiInput('spark', 'my api key is abc', true)).toContain('secret-like-content'));
  it('has deterministic fallback content', () => expect(deterministicFallback('spark', 0).title).toBe('Tiny idea'));
});
