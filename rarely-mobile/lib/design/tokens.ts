/**
 * Shared static design measurements used by RARELY screens and controls.
 * These values are intentionally independent of color mode.
 */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  display: 40,
} as const;

export const radii = {
  md: 16,
  lg: 22,
  pill: 999,
} as const;

export const hitTargets = {
  compact: 40,
} as const;

export const typography = {
  kicker: { fontSize: 11, lineHeight: 15, letterSpacing: 1.6 },
  title: { fontSize: 32, lineHeight: 38 },
  body: { fontSize: 15, lineHeight: 22 },
  card: { fontSize: 14, lineHeight: 20 },
  metadata: { fontSize: 12, lineHeight: 17 },
  button: { fontSize: 15, lineHeight: 20 },
} as const;
