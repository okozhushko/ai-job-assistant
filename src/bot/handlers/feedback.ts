import type { Telegraf } from 'telegraf';
import { blockCompany, getVacancyCompany, markApplied } from '../../storage/vacancyStore';
import { t } from '../../i18n';
import { vacancyKeyboard } from '../vacancyMessage';

export function registerFeedbackHandlers(bot: Telegraf): void {
  bot.action(/^applied:mark:(.+)$/, async (ctx) => {
    const messages = t(ctx);
    const [, vacancyId] = ctx.match;
    const userId = String(ctx.from.id);

    markApplied(userId, vacancyId);
    await ctx.answerCbQuery(messages.vacancy.appliedNoted);

    try {
      await ctx.editMessageReplyMarkup(vacancyKeyboard(vacancyId, messages, true).reply_markup);
    } catch {
      // повідомлення вже змінено (подвійний клік) — ігноруємо
    }
  });

  bot.action(/^applied:noop:(.+)$/, async (ctx) => {
    const messages = t(ctx);
    await ctx.answerCbQuery(messages.vacancy.appliedNoted);
  });

  bot.action(/^skip:(.+)$/, async (ctx) => {
    const messages = t(ctx);
    await ctx.answerCbQuery(messages.feedback.skipped);

    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch {
      // повідомлення вже без кнопок (подвійний клік) — ігноруємо
    }
  });

  bot.action(/^block:(.+)$/, async (ctx) => {
    const messages = t(ctx);
    const [, vacancyId] = ctx.match;
    const userId = String(ctx.from.id);

    const company = getVacancyCompany(userId, vacancyId);
    if (company) {
      blockCompany(userId, company);
      await ctx.answerCbQuery(messages.feedback.companyHidden(company));
    } else {
      await ctx.answerCbQuery(messages.feedback.skipped);
    }

    try {
      await ctx.editMessageReplyMarkup({ inline_keyboard: [] });
    } catch {
      // повідомлення вже без кнопок (подвійний клік) — ігноруємо
    }
  });
}
