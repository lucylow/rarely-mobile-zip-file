import { describe, expect, it } from 'vitest';
import { redactObject } from '../../src/release/v2/security/redaction';
describe('security', () => { it('redacts sensitive keys', () => { expect(redactObject({ token: 'abc', safe: 'ok' })).toEqual({ token: '[REDACTED]', safe: 'ok' }); }); });
