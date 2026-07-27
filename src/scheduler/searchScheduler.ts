import cron from 'node-cron';
import type { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { getAllSettings } from '../settings/settingsStore';
import { runSearchForUser } from '../domain/searchService';

export function startScheduler(bot: Telegraf): void {
  cron.schedule(env.SEARCH_INTERVAL_CRON, async () => {
    const allSettings = await getAllSettings();

    for (const settings of allSettings) {
      try {
        const vacancies = await runSearchForUser(settings);
        if (vacancies.length === 0) continue;

        const text = vacancies.map((v) => `${v.title} — ${v.url}`).join('\n\n');
        await bot.telegram.sendMessage(settings.telegramUserId, `Нові вакансії:\n\n${text}`, {
          link_preview_options: { is_disabled: true },
        });
      } catch (err) {
        console.error(
          `[scheduler] пошук для користувача ${settings.telegramUserId} не вдався:`,
          err,
        );
      }
    }
  });
}
