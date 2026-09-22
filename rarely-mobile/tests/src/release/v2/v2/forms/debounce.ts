export class Debouncer {
  private timer?: ReturnType<typeof setTimeout>;
  constructor(private readonly delayMs: number) {}
  schedule(task: () => void): void { if (this.timer) clearTimeout(this.timer); this.timer = setTimeout(task, this.delayMs); }
  cancel(): void { if (this.timer) clearTimeout(this.timer); this.timer = undefined; }
}
