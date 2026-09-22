export interface Dependency { id: string; dependsOn: string[]; critical: boolean; }
export interface DependencyStatus { id: string; ready: boolean; error?: string; }

export function dependencyOrder(dependencies: Dependency[]): Dependency[] {
  const pending = new Map(dependencies.map((item) => [item.id, item]));
  const ordered: Dependency[] = [];
  const satisfied = new Set<string>();
  let guard = 0;
  while (pending.size && guard < dependencies.length * 3) {
    guard += 1;
    let progress = false;
    for (const [id, dependency] of pending) {
      if (dependency.dependsOn.every((parent) => satisfied.has(parent))) {
        ordered.push(dependency);
        satisfied.add(id);
        pending.delete(id);
        progress = true;
      }
    }
    if (!progress) break;
  }
  return ordered;
}

export function blockedDependencies(dependencies: Dependency[]): string[] {
  const ordered = dependencyOrder(dependencies);
  const ids = new Set(ordered.map((item) => item.id));
  return dependencies.filter((item) => !ids.has(item.id)).map((item) => item.id);
}
