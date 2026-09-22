import { describe, expect, it } from 'vitest';
import { dependencyOrder } from '../../src/release/v2/runtime/dependencyGraph';
import { fixedClock } from '../../src/release/v2/runtime/clock';
describe('runtime safeguards', () => { it('orders dependencies', () => expect(dependencyOrder([{ id: 'b', dependsOn: ['a'], critical: true }, { id: 'a', dependsOn: [], critical: true }])[0].id).toBe('a')); it('uses deterministic clock', async () => { const clock = fixedClock(100); await clock.sleep(50); expect(clock.now()).toBe(150); }); });
