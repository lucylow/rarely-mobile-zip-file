import { allowedEvent, EVENT_ALLOWLIST } from './allowlist';
import { canSendAnalytics, type AnalyticsConsent } from './consent';
import { redactAnalyticsProperties } from './redaction';
import { sampleEvent } from './sampler';
import { makeEvent, type AnalyticsEvent } from './schema';
export class AnalyticsClient { constructor(private consent: AnalyticsConsent, private rate = 1) {} setConsent(consent: AnalyticsConsent): void { this.consent = consent; } build(name: string, sessionId: string, properties: Record<string, string | number | boolean | null> = {}): AnalyticsEvent | undefined { if (!canSendAnalytics(this.consent) || !allowedEvent(name) || !sampleEvent(this.rate)) return undefined; return makeEvent(EVENT_ALLOWLIST.find((item) => item === name)!, sessionId, redactAnalyticsProperties(properties)); } }
