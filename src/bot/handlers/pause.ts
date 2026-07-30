import type { Telegraf } from 'telegraf';
import { getSettings, setPaused } from '../../settings/settingsStore';
import { t } from '../../i18n';

export function registerPauseHandlers(bot: Telegraf): void {
  bot.command('pause', async (ctx) => {
    const messages = t(ctx);
    const userId = String(ctx.from.id);
    if (!getSettings(userId)) {
      await ctx.reply(messages.pause.needSettings);
      return;
    }
    setPaused(userId, true);
    await ctx.reply(messages.pause.paused);
  });

  bot.command('resume', async (ctx) => {
    const messages = t(ctx);
    const userId = String(ctx.from.id);
    if (!getSettings(userId)) {
      await ctx.reply(messages.pause.needSettings);
      return;
    }
    setPaused(userId, false);
    await ctx.reply(messages.pause.resumed);
  });
}
