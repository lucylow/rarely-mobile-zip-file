export type TaskResult<T> = { ok: true; value: T } | { ok: false; error: Error };

export async function safeTask<T>(label: string, task: () => Promise<T>, onError: (label: string, error: Error) => void): Promise<TaskResult<T>> {
  try {
    return { ok: true, value: await task() };
  } catch (error) {
    const normalized = error instanceof Error ? error : new Error(String(error));
    onError(label, normalized);
    return { ok: false, error: normalized };
  }
}

export async function parallelSafe<T>(tasks: Array<{ label: string; run: () => Promise<T> }>, onError: (label: string, error: Error) => void): Promise<Array<TaskResult<T>>> {
  return Promise.all(tasks.map((task) => safeTask(task.label, task.run, onError)));
}
