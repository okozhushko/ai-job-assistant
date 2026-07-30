import { Markup } from 'telegraf';
import type { Vacancy } from '../domain/types';
import type { Messages } from '../i18n';

export function vacancyKeyboard(vacancyId: string) {
  return Markup.inlineKeyboard([
    Markup.button.callback('👍', `vote:like:${vacancyId}`),
    Markup.button.callback('👎', `vote:dislike:${vacancyId}`),
  ]);
}

export function formatVacancy(v: Vacancy, t: Messages): string {
  const title = v.company
    ? `*${escapeMarkdown(v.title)}* — ${escapeMarkdown(v.company)}`
    : `*${escapeMarkdown(v.title)}*`;
  const location = v.location ? escapeMarkdown(v.location) : '';
  const link = `[${t.vacancy.viewLink}](${v.url})`;
  return [title, location, link].filter(Boolean).join('\n');
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}
