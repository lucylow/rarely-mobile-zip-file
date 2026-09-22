import { describe, expect, it } from 'vitest';
import { redactAnalyticsProperties } from '../../src/release/v2/analytics/redaction';
describe('analytics privacy', () => { it('redacts journal-like fields', () => expect(redactAnalyticsProperties({ journalBody:'secret', safe:1 })).toEqual({ journalBody:'[REDACTED]', safe:1 })); });
