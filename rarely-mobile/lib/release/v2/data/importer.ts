import { verifyExportBundle, type ExportBundle } from './exporter';

export interface ImportPlan {
  valid: boolean;
  warnings: string[];
  journals: number;
  moments: number;
  routines: number;
}

export function planImport(bundle: ExportBundle): ImportPlan {
  const warnings: string[] = [];
  if (!verifyExportBundle(bundle)) return { valid: false, warnings: ['checksum-or-format-invalid'], journals: 0, moments: 0, routines: 0 };
  if (bundle.journals.length > 10_000) warnings.push('journal-count-high');
  if (bundle.moments.length > 10_000) warnings.push('moment-count-high');
  if (bundle.routines.length > 2_000) warnings.push('routine-count-high');
  return { valid: true, warnings, journals: bundle.journals.length, moments: bundle.moments.length, routines: bundle.routines.length };
}
