import { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { registerStartHandlers } from './handlers/start';
import { registerSettingsHandlers } from './handlers/settings';
import { registerSearchHandlers } from './handlers/search';

export function createBot(): Telegraf {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  registerStartHandlers(bot);
  registerSettingsHandlers(bot);
  registerSearchHandlers(bot);

  bot.catch((err, ctx) => {
    console.error(`[bot] помилка при обробці update ${ctx.updateType}:`, err);
  });

  return bot;
}
