import cron from 'node-cron';
import type { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { getAllSettings } from '../settings/settingsStore';
import { runSearchForUser } from '../domain/searchService';
import { buildVacancyMessage, MAX_VACANCIES_PER_RUN } from '../bot/vacancyMessage';
import { resolveStoredLocale, getMessages } from '../i18n';
import { markSeen, isApplied } from '../storage/vacancyStore';

export function startScheduler(bot: Telegraf): void {
  cron.schedule(env.SEARCH_INTERVAL_CRON, async () => {
    const allSettings = getAllSettings().filter((s) => !s.paused);

    for (const settings of allSettings) {
      try {
        const { vacancies } = await runSearchForUser(settings);
        if (vacancies.length === 0) continue;

        const userId = String(settings.telegramUserId);
        const messages = getMessages(resolveStoredLocale(userId));
        for (const vacancy of vacancies.slice(0, MAX_VACANCIES_PER_RUN)) {
          const { text, extra } = buildVacancyMessage(
            vacancy,
            messages,
            isApplied(userId, vacancy.id),
          );
          await bot.telegram.sendMessage(settings.telegramUserId, text, extra);
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
