export interface PerfMeasurement {
  name: string;
  durationMs: number;
  at: number;
}

export async function measure<T>(name: string, task: () => Promise<T>, sink: (measurement: PerfMeasurement) => void): Promise<T> {
  const started = performance.now();
  try {
    return await task();
  } finally {
    sink({ name, durationMs: Math.round((performance.now() - started) * 100) / 100, at: Date.now() });
  }
}
