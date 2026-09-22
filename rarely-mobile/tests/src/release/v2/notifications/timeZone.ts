export interface LocalTimeParts {
  hour: number;
  minute: number;
  timeZone: string;
}

export function localParts(timestamp: number, timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): LocalTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone });
  const [hour, minute] = formatter.format(timestamp).split(':').map(Number);
  return { hour, minute, timeZone };
}

export function sameLocalDay(a: number, b: number, timeZone: string): boolean {
  const formatter = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone });
  return formatter.format(a) === formatter.format(b);
}
