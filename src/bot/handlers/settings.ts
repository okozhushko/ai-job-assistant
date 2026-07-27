import type { Telegraf } from 'telegraf';
import { COUNTRIES, SOURCES, toggleKeyboard } from '../keyboards';
import { startDraft, getDraft, clearDraft } from '../state';
import { getSettings, saveSettings } from '../../settings/settingsStore';
import type { UserSettings } from '../../domain/types';

export function registerSettingsHandlers(bot: Telegraf): void {
  bot.command('settings', async (ctx) => {
    startDraft(ctx.from.id);
    await ctx.reply('Введи назву посади, яку шукаєш (наприклад: "Backend Developer"):');
  });

  bot.command('mysettings', async (ctx) => {
    const settings = await getSettings(String(ctx.from.id));
    if (!settings) {
      await ctx.reply('Налаштування ще не задано. Введи /settings, щоб почати.');
      return;
    }
    await ctx.reply(formatSettings(settings));
  });

  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return next();

    const draft = getDraft(ctx.from.id);
    if (!draft) return next();

    if (draft.step === 'title') {
      draft.jobTitle = text.trim();
      draft.step = 'stack';
      await ctx.reply('Тепер введи стек через кому (наприклад: Node.js, TypeScript, PostgreSQL):');
      return;
    }

    if (draft.step === 'stack') {
      draft.stack = text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      draft.step = 'countries';
      await ctx.reply(
        'Обери країни пошуку:',
        toggleKeyboard(COUNTRIES, draft.countries, 'country'),
      );
      return;
    }

    return next();
  });

  bot.action(/^country:(.+)$/, async (ctx) => {
    const draft = getDraft(ctx.from.id);
    if (!draft || draft.step !== 'countries') {
      await ctx.answerCbQuery();
      return;
    }

    const value = ctx.match[1];
    if (value === 'done') {
      if (draft.countries.size === 0) {
        await ctx.answerCbQuery('Обери хоча б одну країну');
        return;
      }
      draft.step = 'sources';
      await ctx.editMessageText(
        'Обери джерела вакансій:',
        toggleKeyboard(SOURCES, draft.sources, 'source'),
      );
      return;
    }

    if (draft.countries.has(value)) draft.countries.delete(value);
    else draft.countries.add(value);
    await ctx.editMessageReplyMarkup(
      toggleKeyboard(COUNTRIES, draft.countries, 'country').reply_markup,
    );
    await ctx.answerCbQuery();
  });

  bot.action(/^source:(.+)$/, async (ctx) => {
    const draft = getDraft(ctx.from.id);
    if (!draft || draft.step !== 'sources') {
      await ctx.answerCbQuery();
      return;
    }

    const value = ctx.match[1];
    if (value === 'done') {
      if (draft.sources.size === 0) {
        await ctx.answerCbQuery('Обери хоча б одне джерело');
        return;
      }

      const existing = await getSettings(String(ctx.from.id));
      const now = new Date().toISOString();
      const settings: UserSettings = {
        telegramUserId: ctx.from.id,
        jobTitle: draft.jobTitle!,
        stack: draft.stack!,
        countries: Array.from(draft.countries),
        sources: Array.from(draft.sources),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      await saveSettings(settings);
      clearDraft(ctx.from.id);
      await ctx.editMessageText(
        `Готово!\n\n${formatSettings(settings)}\n\nВикористай /search, щоб знайти вакансії зараз.`,
      );
      return;
    }

    if (draft.sources.has(value)) draft.sources.delete(value);
    else draft.sources.add(value);
    await ctx.editMessageReplyMarkup(toggleKeyboard(SOURCES, draft.sources, 'source').reply_markup);
    await ctx.answerCbQuery();
  });
}

function formatSettings(settings: UserSettings): string {
  return [
    `Посада: ${settings.jobTitle}`,
    `Стек: ${settings.stack.join(', ')}`,
    `Країни: ${settings.countries.join(', ')}`,
    `Джерела: ${settings.sources.join(', ')}`,
  ].join('\n');
}
