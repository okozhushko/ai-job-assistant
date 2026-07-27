export type WizardStep = 'title' | 'stack' | 'countries' | 'sources';

export interface WizardDraft {
  step: WizardStep;
  jobTitles?: string[];
  stack?: string[];
  countries: Set<string>;
  sources: Set<string>;
}

// Стан майстра налаштувань живе в пам'яті процесу — після рестарту
// незавершений /settings доведеться почати заново. Прийнятно для MVP.
const drafts = new Map<number, WizardDraft>();

export function startDraft(userId: number): WizardDraft {
  const draft: WizardDraft = { step: 'title', countries: new Set(), sources: new Set() };
  drafts.set(userId, draft);
  return draft;
}

export function getDraft(userId: number): WizardDraft | undefined {
  return drafts.get(userId);
}

export function clearDraft(userId: number): void {
  drafts.delete(userId);
}
