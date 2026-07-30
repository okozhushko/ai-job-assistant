import type { Telegraf } from 'telegraf';
import { getCountries, SOURCES, toggleKeyboard } from '../keyboards';
import { startDraft, getDraft, clearDraft } from '../state';
import { getSettings, saveSettings } from '../../settings/settingsStore';
import { t } from '../../i18n';
import type { UserSettings } from '../../domain/types';
import type { Messages } from '../../i18n';

export function registerSettingsHandlers(bot: Telegraf): void {
  bot.command('settings', async (ctx) => {
    const messages = t(ctx);
    startDraft(ctx.from.id);
    await ctx.reply(messages.settings.askTitle);
  });

  bot.command('mysettings', async (ctx) => {
    const messages = t(ctx);
    const settings = getSettings(String(ctx.from.id));
    if (!settings) {
      await ctx.reply(messages.settings.notSetYet);
      return;
    }
    await ctx.reply(formatSettings(settings, messages));
  });

  bot.on('text', async (ctx, next) => {
    const text = ctx.message.text;
    if (text.startsWith('/')) return next();

    const draft = getDraft(ctx.from.id);
    if (!draft) return next();

    const messages = t(ctx);

    if (draft.step === 'title') {
      draft.jobTitles = text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      draft.step = 'stack';
      await ctx.reply(messages.settings.askStack);
      return;
    }

    if (draft.step === 'stack') {
      draft.stack = text
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      draft.step = 'exclude';
      await ctx.reply(messages.settings.askExclude);
      return;
    }

    if (draft.step === 'exclude') {
      const trimmed = text.trim();
      draft.excludeKeywords =
        trimmed === '-' || trimmed === ''
          ? []
          : trimmed
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean);
      draft.step = 'countries';
      await ctx.reply(
        messages.settings.askCountries,
        toggleKeyboard(getCountries(messages), draft.countries, 'country', messages.doneButton),
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
    const messages = t(ctx);

    const value = ctx.match[1];
    if (value === 'done') {
      if (draft.countries.size === 0) {
        await ctx.answerCbQuery(messages.settings.needAtLeastOneCountry);
        return;
      }
      draft.step = 'sources';
      await ctx.editMessageText(
        messages.settings.askSources,
        toggleKeyboard(SOURCES, draft.sources, 'source', messages.doneButton),
      );
      return;
    }

    if (draft.countries.has(value)) draft.countries.delete(value);
    else draft.countries.add(value);
    await ctx.editMessageReplyMarkup(
      toggleKeyboard(getCountries(messages), draft.countries, 'country', messages.doneButton)
        .reply_markup,
    );
    await ctx.answerCbQuery();
  });

  bot.action(/^source:(.+)$/, async (ctx) => {
    const draft = getDraft(ctx.from.id);
    if (!draft || draft.step !== 'sources') {
      await ctx.answerCbQuery();
      return;
    }
    const messages = t(ctx);

    const value = ctx.match[1];
    if (value === 'done') {
      if (draft.sources.size === 0) {
        await ctx.answerCbQuery(messages.settings.needAtLeastOneSource);
        return;
      }

      const existing = getSettings(String(ctx.from.id));
      const now = new Date().toISOString();
      const settings: UserSettings = {
        telegramUserId: ctx.from.id,
        jobTitles: draft.jobTitles!,
        stack: draft.stack!,
        excludeKeywords: draft.excludeKeywords ?? [],
        countries: Array.from(draft.countries),
        sources: Array.from(draft.sources),
        paused: existing?.paused ?? false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      saveSettings(settings);
      clearDraft(ctx.from.id);
      await ctx.editMessageText(messages.settings.done(formatSettings(settings, messages)));
      return;
    }

    if (draft.sources.has(value)) draft.sources.delete(value);
    else draft.sources.add(value);
    await ctx.editMessageReplyMarkup(
      toggleKeyboard(SOURCES, draft.sources, 'source', messages.doneButton).reply_markup,
    );
    await ctx.answerCbQuery();
  });
}

function formatSettings(settings: UserSettings, messages: Messages): string {
  const l = messages.settings.labels;
  return [
    `${l.jobTitle}: ${settings.jobTitles.join(', ')}`,
    `${l.stack}: ${settings.stack.join(', ')}`,
    `${l.exclude}: ${settings.excludeKeywords.length > 0 ? settings.excludeKeywords.join(', ') : l.excludeEmpty}`,
    `${l.countries}: ${settings.countries.join(', ')}`,
    `${l.sources}: ${settings.sources.join(', ')}`,
    `${l.status}: ${settings.paused ? l.paused : l.active}`,
  ].join('\n');
}
