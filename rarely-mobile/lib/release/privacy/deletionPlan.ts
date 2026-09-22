export interface DeletionResource { id: string; label: string; local: boolean; required: boolean; run: () => Promise<void>; }
export interface DeletionPlanResult { completed: string[]; failed?: string; }

export async function executeDeletionPlan(resources: DeletionResource[]): Promise<DeletionPlanResult> {
  const completed: string[] = [];
  for (const resource of resources) {
    try { await resource.run(); completed.push(resource.id); }
    catch (error) { if (resource.required) return { completed, failed: resource.id }; }
  }
  return { completed };
}
