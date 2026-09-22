import type { DeletionResource, DeletionStep } from './deletionPlan';

export interface DeletionAdapter {
  execute(resource: DeletionResource, userId: string): Promise<void>;
}

export interface DeletionProgress {
  completed: DeletionResource[];
  failed?: { resource: DeletionResource; reason: string };
}

export async function executeDeletion(userId: string, steps: DeletionStep[], adapter: DeletionAdapter): Promise<DeletionProgress> {
  const completed: DeletionResource[] = [];
  for (const step of steps) {
    if (step.completed) continue;
    try {
      await adapter.execute(step.resource, userId);
      completed.push(step.resource);
    } catch (error) {
      return {
        completed,
        failed: { resource: step.resource, reason: error instanceof Error ? error.message : 'unknown' },
      };
    }
  }
  return { completed };
}
