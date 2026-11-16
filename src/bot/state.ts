export type WizardStep = 'title' | 'stack' | 'exclude' | 'countries' | 'sources';

export interface WizardDraft {
  step: WizardStep;
  jobTitles?: string[];
  stack?: string[];
  excludeKeywords?: string[];
  countries: Set<string>;
  sources: Set<string>;
}

// Стан майстра налаштувань живе в пам'яті процесу — після рестарту
// незавершений /settings доведеться почати заново. Прийнятно для MVP.
const drafts = new Map<number, WizardDraft>();

export function startDraft(userId: number): void {
  drafts.set(userId, { step: 'title', countries: new Set(), sources: new Set() });
}

export function getDraft(userId: number): WizardDraft | undefined {
  return drafts.get(userId);
}

export function clearDraft(userId: number): void {
  drafts.delete(userId);
}
