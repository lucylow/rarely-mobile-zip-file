export interface SeededFactory<T> {
  make(index: number): T;
}

export function createSeededFactory<T>(prefix: string, make: (index: number, id: string) => T): SeededFactory<T> {
  return {
    make(index: number) {
      const id = `${prefix}-${String(index + 1).padStart(4, '0')}`;
      return make(index, id);
    },
  };
}

export function range(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index);
}

export function seededDate(index: number, base = Date.UTC(2026, 0, 1)): number {
  return base + index * 86_400_000;
}
