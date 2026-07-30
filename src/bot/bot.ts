import { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { registerStartHandlers } from './handlers/start';
import { registerSettingsHandlers } from './handlers/settings';
import { registerSearchHandlers } from './handlers/search';
import { registerPauseHandlers } from './handlers/pause';
import { registerFeedbackHandlers } from './handlers/feedback';
import { registerLanguageHandlers } from './handlers/language';
import { buildCommands } from './commands';
import { getMessages } from '../i18n';

export function createBot(): Telegraf {
  const bot = new Telegraf(env.TELEGRAM_BOT_TOKEN);

  registerStartHandlers(bot);
  registerSettingsHandlers(bot);
  registerSearchHandlers(bot);
  registerPauseHandlers(bot);
  registerFeedbackHandlers(bot);
  registerLanguageHandlers(bot);

  bot.catch((err, ctx) => {
    console.error(`[bot] помилка при обробці update ${ctx.updateType}:`, err);
  });

  return bot;
}

export async function registerBotCommands(bot: Telegraf): Promise<void> {
  // Дефолтний список (для мов, яких ми ще не підтримуємо, напр. pl/es) — англійська,
  // плюс явні мовно-специфічні списки для uk/en так Telegram сам показує рідне меню.
  await bot.telegram.setMyCommands(buildCommands(getMessages('en')));
  await bot.telegram.setMyCommands(buildCommands(getMessages('uk')), { language_code: 'uk' });
  await bot.telegram.setMyCommands(buildCommands(getMessages('en')), { language_code: 'en' });
}
