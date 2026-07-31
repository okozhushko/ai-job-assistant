import type { Telegraf } from 'telegraf';
import { getSettings } from '../../settings/settingsStore';
import { runSearchForUser } from '../../domain/searchService';
import { markSeen, isApplied } from '../../storage/vacancyStore';
import { getSourceName } from '../../sources';
import { formatVacancy, vacancyKeyboard } from '../vacancyMessage';
import { t } from '../../i18n';

// Кожна вакансія — окреме повідомлення з кнопками 👍/👎, тож обмежуємо
// кількість за один прогін, щоб не заспамити чат при широких фільтрах.
const MAX_RESULTS_SHOWN = 15;

export function registerSearchHandlers(bot: Telegraf): void {
  bot.command('search', async (ctx) => {
    const messages = t(ctx);
    const settings = getSettings(String(ctx.from.id));
    if (!settings) {
      await ctx.reply(messages.search.needSettings);
      return;
    }

    await ctx.reply(messages.search.searching);
    const { vacancies, failedSources } = await runSearchForUser(settings);

    if (failedSources.length > 0) {
      const names = failedSources.map(getSourceName).join(', ');
      await ctx.reply(messages.search.sourceUnavailable(names));
    }

    if (vacancies.length === 0) {
      await ctx.reply(messages.search.noneFound);
      return;
    }

    const userId = String(ctx.from.id);
    const shown = vacancies.slice(0, MAX_RESULTS_SHOWN);
    for (const vacancy of shown) {
      const applied = isApplied(userId, vacancy.id);
      await ctx.reply(formatVacancy(vacancy, messages, applied), {
        parse_mode: 'Markdown',
        link_preview_options: { is_disabled: true },
        ...vacancyKeyboard(vacancy.id, messages, applied),
      });
    }
    // Позначаємо "побаченими" лише те, що реально показали — решта
    // залишається доступною на наступний /search (наступна порція).
    markSeen(String(ctx.from.id), shown);

    if (vacancies.length > shown.length) {
      await ctx.reply(messages.search.truncated(shown.length, vacancies.length));
    }
  });
}
