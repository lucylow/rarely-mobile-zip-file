import { describe, expect, it } from 'vitest';
import { RELEASE_SCENARIOS, recoverableScenarioCount } from '../../src/release/v2/mocks/releaseScenarios';
describe('release scenario catalog', () => { it('contains broad failure coverage', () => { expect(RELEASE_SCENARIOS.length).toBeGreaterThan(25); expect(recoverableScenarioCount()).toBe(RELEASE_SCENARIOS.length); }); });
