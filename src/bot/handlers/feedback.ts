import type { Telegraf } from 'telegraf';
import { blockCompany, getVacancyCompany } from '../../storage/vacancyStore';
import { t } from '../../i18n';

export function registerFeedbackHandlers(bot: Telegraf): void {
  bot.action(/^vote:(like|dislike):(.+)$/, async (ctx) => {
    const messages = t(ctx);
    const [, verdict, vacancyId] = ctx.match;
    const userId = String(ctx.from.id);

    if (verdict === 'dislike') {
      const company = getVacancyCompany(userId, vacancyId);
      if (company) {
        blockCompany(userId, company);
        await ctx.answerCbQuery(messages.feedback.companyHidden(company));
      } else {
        await ctx.answerCbQuery(messages.feedback.noted);
      }
    } else {
      await ctx.answerCbQuery(messages.feedback.liked);
    }

    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch {
      // повідомлення вже без кнопок (подвійний клік) — ігноруємо
    }
  });
}
