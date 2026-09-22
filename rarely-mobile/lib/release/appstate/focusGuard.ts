export class FocusGuard { private active = true; setActive(value: boolean): void { this.active = value; } get isActive(): boolean { return this.active; } }
