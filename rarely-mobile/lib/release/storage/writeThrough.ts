export class SerializedWriter<T> {
  private pending: Promise<void> = Promise.resolve();
  constructor(private readonly write: (value: T) => Promise<void>) {}

  enqueue(value: T): Promise<void> {
    this.pending = this.pending.then(() => this.write(value));
    return this.pending;
  }
}

export async function writeWithRollback<T>(input: {
  next: T;
  readPrevious: () => Promise<T | undefined>;
  write: (value: T) => Promise<void>;
  rollback: (previous: T) => Promise<void>;
}): Promise<void> {
  const previous = await input.readPrevious();
  try {
    await input.write(input.next);
  } catch (error) {
    if (previous !== undefined) {
      try {
        await input.rollback(previous);
      } catch {
        // The original write failure remains the primary error.
      }
    }
    throw error;
  }
}
