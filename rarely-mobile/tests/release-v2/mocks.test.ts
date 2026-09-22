import { describe, expect, it } from 'vitest';
import { MOCK_MOMENTS, MOCK_JOURNALS, MOCK_USERS, MOCK_POSTS } from '../../src/release/v2/mocks';
describe('mock catalog', () => { it('is substantial and deterministic', () => { expect(MOCK_MOMENTS.length).toBe(500); expect(MOCK_JOURNALS.length).toBe(300); expect(MOCK_USERS.length).toBe(250); expect(MOCK_POSTS.length).toBe(600); expect(MOCK_MOMENTS[0].id).toBe('moment-0001'); }); });
