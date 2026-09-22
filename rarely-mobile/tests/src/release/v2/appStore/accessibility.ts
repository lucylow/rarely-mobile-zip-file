export type AccessibilityFeature = 'voiceOver' | 'voiceControl' | 'largeText' | 'reducedMotion' | 'dynamicType' | 'captions';

export interface AccessibilityClaim {
  feature: AccessibilityFeature;
  supported: boolean;
  notes: string;
}

export const ACCESSIBILITY_CLAIMS: readonly AccessibilityClaim[] = [
  { feature: 'voiceOver', supported: true, notes: 'Interactive controls use accessible labels and state descriptions.' },
  { feature: 'voiceControl', supported: true, notes: 'Primary actions expose native accessible semantics.' },
  { feature: 'largeText', supported: true, notes: 'Text styles use scaling-friendly sizes and wrapping.' },
  { feature: 'reducedMotion', supported: true, notes: 'Animation helpers can resolve to zero-duration transitions.' },
  { feature: 'dynamicType', supported: true, notes: 'UI layouts reserve space for larger text.' },
  { feature: 'captions', supported: true, notes: 'Media components accept optional captions/subtitle resources.' },
];

export function accessibilitySummary(): string {
  return ACCESSIBILITY_CLAIMS.filter((claim) => claim.supported)
    .map((claim) => `${claim.feature}: ${claim.notes}`)
    .join('\n');
}
