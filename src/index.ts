import type { Telegraf } from 'telegraf';
import { createBot } from './bot/bot';
import { startScheduler } from './scheduler/searchScheduler';

let bot: Telegraf | undefined;

async function main(): Promise<void> {
  bot = createBot();
  startScheduler(bot);
  await bot.launch();
  console.log('ai-career-assistant бот запущено');
}

process.once('SIGINT', () => bot?.stop('SIGINT'));
process.once('SIGTERM', () => bot?.stop('SIGTERM'));

main().catch((err) => {
  console.error('Не вдалося запустити бота:', err);
  process.exit(1);
});
