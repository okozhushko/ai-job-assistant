import type { Telegraf } from 'telegraf';
import { getSettings } from '../../settings/settingsStore';
import { runSearchForUser } from '../../domain/searchService';
import { markSeen, isApplied } from '../../storage/vacancyStore';
import { buildVacancyMessage, MAX_VACANCIES_PER_RUN } from '../vacancyMessage';
import { t } from '../../i18n';

export function registerSearchHandlers(bot: Telegraf): void {
  bot.command('search', async (ctx) => {
    const messages = t(ctx);
    const userId = String(ctx.from.id);
    const settings = getSettings(userId);
    if (!settings) {
      await ctx.reply(messages.search.needSettings);
      return;
    }

    await ctx.reply(messages.search.searching);
    const { vacancies, failedSources } = await runSearchForUser(settings);

    if (failedSources.length > 0) {
      await ctx.reply(messages.search.sourceUnavailable(failedSources.join(', ')));
    }

    if (vacancies.length === 0) {
      await ctx.reply(messages.search.noneFound);
      return;
    }

    const shown = vacancies.slice(0, MAX_VACANCIES_PER_RUN);
    for (const vacancy of shown) {
      const { text, extra } = buildVacancyMessage(vacancy, messages, isApplied(userId, vacancy.id));
      await ctx.reply(text, extra);
    }
    // Позначаємо "побаченими" лише те, що реально показали — решта
    // залишається доступною на наступний /search (наступна порція).
    markSeen(userId, shown);

    if (vacancies.length > shown.length) {
      await ctx.reply(messages.search.truncated(shown.length, vacancies.length));
    }
  });
}
