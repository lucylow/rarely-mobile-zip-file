import type { JournalDraftV2 } from './model';

export interface JournalSaver {
  saveDraft(draft: JournalDraftV2): Promise<void>;
}

export class AutosaveController {
  private timer: ReturnType<typeof setTimeout> | undefined;
  private latest: JournalDraftV2 | undefined;
  private saving = false;

  constructor(private readonly saver: JournalSaver, private readonly delayMs = 900) {}

  queue(draft: JournalDraftV2): void {
    this.latest = { ...draft, dirty: true };
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), this.delayMs);
  }

  async flush(): Promise<void> {
    if (this.saving || !this.latest) return;
    const draft = this.latest;
    this.saving = true;
    try {
      await this.saver.saveDraft({ ...draft, dirty: false });
      if (this.latest.updatedAt <= draft.updatedAt) this.latest = { ...draft, dirty: false };
    } finally {
      this.saving = false;
    }
  }
}
