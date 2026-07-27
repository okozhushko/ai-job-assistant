import type { Telegraf } from 'telegraf';
import { getSettings } from '../../settings/settingsStore';
import { runSearchForUser } from '../../domain/searchService';
import type { Vacancy } from '../../domain/types';

export function registerSearchHandlers(bot: Telegraf): void {
  bot.command('search', async (ctx) => {
    const settings = await getSettings(String(ctx.from.id));
    if (!settings) {
      await ctx.reply('Спочатку задай налаштування: /settings');
      return;
    }

    await ctx.reply('Шукаю вакансії...');
    const vacancies = await runSearchForUser(settings);
    if (vacancies.length === 0) {
      await ctx.reply('Нових вакансій не знайдено.');
      return;
    }

    for (const batch of chunk(vacancies, 10)) {
      await ctx.reply(formatVacancies(batch), {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
      });
    }
  });
}

function formatVacancies(vacancies: Vacancy[]): string {
  return vacancies
    .map((v) => {
      const title = v.company ? `*${escapeMarkdown(v.title)}* — ${escapeMarkdown(v.company)}` : `*${escapeMarkdown(v.title)}*`;
      const location = v.location ? escapeMarkdown(v.location) : '';
      const link = `[Переглянути](${v.url})`;
      return [title, location, link].filter(Boolean).join('\n');
    })
    .join('\n\n');
}

function escapeMarkdown(text: string): string {
  return text.replace(/([_*[\]()~`>#+\-=|{}.!])/g, '\\$1');
}

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}
