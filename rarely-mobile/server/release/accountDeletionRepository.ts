export type DeletionJobState = "queued" | "running" | "complete" | "failed";
export interface DeletionJob { jobId: string; userId: string; state: DeletionJobState; createdAt: number; updatedAt: number; error?: string; }

export class InMemoryDeletionRepository {
  private readonly jobs = new Map<string, DeletionJob>();
  enqueue(userId: string, now = Date.now()): DeletionJob { const existing = [...this.jobs.values()].find((job) => job.userId === userId && job.state !== "complete"); if (existing) return { ...existing }; const job={ jobId:`del_${now.toString(36)}_${this.jobs.size}`, userId, state:"queued" as const, createdAt:now, updatedAt:now }; this.jobs.set(job.jobId, job); return { ...job }; }
  update(jobId: string, state: DeletionJobState, error?: string, now = Date.now()): void { const job=this.jobs.get(jobId); if (!job) return; job.state=state; job.updatedAt=now; job.error=error?.slice(0,300); }
  get(jobId: string): DeletionJob | undefined { const job=this.jobs.get(jobId); return job ? { ...job } : undefined; }
}
