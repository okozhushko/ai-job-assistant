import cron from 'node-cron';
import type { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { getAllSettings } from '../settings/settingsStore';
import { runSearchForUser } from '../domain/searchService';
import { formatVacancy, vacancyKeyboard } from '../bot/vacancyMessage';
import { resolveStoredLocale, getMessages } from '../i18n';
import { markSeen, isApplied } from '../storage/vacancyStore';

const MAX_RESULTS_PER_RUN = 15;

export function startScheduler(bot: Telegraf): void {
  cron.schedule(env.SEARCH_INTERVAL_CRON, async () => {
    const allSettings = getAllSettings().filter((s) => !s.paused);

    for (const settings of allSettings) {
      try {
        const { vacancies } = await runSearchForUser(settings);
        if (vacancies.length === 0) continue;

        const userId = String(settings.telegramUserId);
        const messages = getMessages(resolveStoredLocale(userId));
        for (const vacancy of vacancies.slice(0, MAX_RESULTS_PER_RUN)) {
          const applied = isApplied(userId, vacancy.id);
          await bot.telegram.sendMessage(
            settings.telegramUserId,
            formatVacancy(vacancy, messages, applied),
            {
              parse_mode: 'Markdown',
              link_preview_options: { is_disabled: true },
              ...vacancyKeyboard(vacancy.id, messages, applied),
            },
          );
          // Позначаємо одразу після успішної відправки — якщо надсилання
          // наступної вакансії впаде (напр. користувач заблокував бота),
          // вже надіслані не загубляться і не позначаться помилково.
          markSeen(userId, [vacancy]);
        }
      } catch (err) {
        console.error(
          `[scheduler] пошук для користувача ${settings.telegramUserId} не вдався:`,
          err,
        );
      }
    }
  });
}
