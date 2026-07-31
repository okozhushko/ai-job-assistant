import type { Telegraf } from 'telegraf';
import { clearSeen } from '../../storage/vacancyStore';
import { t } from '../../i18n';

export function registerHistoryHandlers(bot: Telegraf): void {
  bot.command('clear', async (ctx) => {
    const messages = t(ctx);
    const userId = String(ctx.from.id);
    const count = clearSeen(userId);
    await ctx.reply(messages.history.cleared(count));
  });
}
