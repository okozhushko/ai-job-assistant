import { Markup } from 'telegraf';
import type { Vacancy } from '../domain/types';
import type { Messages } from '../i18n';

export function vacancyKeyboard(vacancyId: string, t: Messages, applied: boolean) {
  return Markup.inlineKeyboard([
    [
      applied
        ? Markup.button.callback(t.vacancy.appliedButton, `applied:noop:${vacancyId}`)
        : Markup.button.callback(t.vacancy.markApplied, `applied:mark:${vacancyId}`),
      Markup.button.callback(t.vacancy.skipButton, `skip:${vacancyId}`),
      Markup.button.callback(t.vacancy.blockButton, `block:${vacancyId}`),
    ],
  ]);
}

export function formatVacancy(v: Vacancy, t: Messages, applied: boolean): string {
  const title = v.company
    ? `*${escapeMarkdown(v.title)}* — ${escapeMarkdown(v.company)}`
    : `*${escapeMarkdown(v.title)}*`;
  const location = v.location ? escapeMarkdown(v.location) : '';
  const link = `[${t.vacancy.viewLink}](${v.url})`;
  const appliedLabel = applied ? t.vacancy.appliedLabel : '';
  return [title, location, link, appliedLabel].filter(Boolean).join('\n');
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
