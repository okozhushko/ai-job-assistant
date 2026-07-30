import type { Telegraf } from 'telegraf';
import { t } from '../../i18n';

export function registerStartHandlers(bot: Telegraf): void {
  bot.start(async (ctx) => {
    await ctx.reply(t(ctx).start.greeting);
  });

  bot.help(async (ctx) => {
    await ctx.reply(t(ctx).help);
  });
}
