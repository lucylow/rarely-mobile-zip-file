import { describe, expect, it } from 'vitest';
import { isQuietHour } from '../../src/release/v2/permissions/notificationPolicy';
describe('notification policy', () => { it('supports overnight quiet hours', () => { expect(isQuietHour(23, { enabled: true, quietStartHour: 22, quietEndHour: 8, kinds: {} })).toBe(true); expect(isQuietHour(12, { enabled: true, quietStartHour: 22, quietEndHour: 8, kinds: {} })).toBe(false); }); });
