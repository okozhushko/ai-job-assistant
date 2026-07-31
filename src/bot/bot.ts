import { Telegraf } from 'telegraf';
import { env } from '../config/env';
import { registerStartHandlers } from './handlers/start';
import { registerSettingsHandlers } from './handlers/settings';
import { registerSearchHandlers } from './handlers/search';
import { registerPauseHandlers } from './handlers/pause';
import { registerFeedbackHandlers } from './handlers/feedback';
import { registerLanguageHandlers } from './handlers/language';
import { registerHistoryHandlers } from './handlers/history';
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
  registerHistoryHandlers(bot);

  bot.catch((err, ctx) => {
    console.error(`[bot] помилка при обробці update ${ctx.updateType}:`, err);
  });

  return bot;
}

export async function registerBotCommands(bot: Telegraf): Promise<void> {
  // Бот працює лише в приватних чатах, а scope "all_private_chats" пріоритетніший
  // за "default" - якщо там лишився старий список (напр. з початкового
  // /setcommands у BotFather), Telegram покаже саме його, навіть якщо ми
  // оновили лише "default". Тому реєструємо однаковий список в обох scope.
  const scopes = [{ type: 'default' as const }, { type: 'all_private_chats' as const }];

  for (const scope of scopes) {
    await bot.telegram.setMyCommands(buildCommands(getMessages('en')), { scope });
    await bot.telegram.setMyCommands(buildCommands(getMessages('uk')), {
      scope,
      language_code: 'uk',
    });
    await bot.telegram.setMyCommands(buildCommands(getMessages('en')), {
      scope,
      language_code: 'en',
    });
  }
}
