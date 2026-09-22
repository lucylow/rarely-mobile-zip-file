export interface MigrationStep { from: number; to: number; run: () => Promise<void>; }

export async function migrate(version: number, target: number, steps: MigrationStep[]): Promise<number> {
  let current = version;
  while (current < target) {
    const step = steps.find((candidate) => candidate.from === current);
    if (!step) throw new Error(`Missing migration from ${current}`);
    if (step.to !== current + 1) throw new Error(`Invalid migration jump ${current} -> ${step.to}`);
    await step.run();
    current = step.to;
  }
  return current;
}
