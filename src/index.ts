import type { Server } from 'node:http';
import type { Telegraf } from 'telegraf';
import { createBot, registerBotCommands } from './bot/bot';
import { startScheduler } from './scheduler/searchScheduler';
import { startHealthServer } from './health/healthServer';
import { migrateLegacyJsonIfNeeded } from './storage/migrateLegacyJson';
import { env } from './config/env';

let bot: Telegraf | undefined;
let healthServer: Server | undefined;

async function main(): Promise<void> {
  migrateLegacyJsonIfNeeded();
  healthServer = startHealthServer(env.HEALTH_PORT);
  bot = createBot();
  await registerBotCommands(bot);
  startScheduler(bot);
  await bot.launch();
  console.log('ai-career-assistant бот запущено');
}

function shutdown(signal: string): void {
  bot?.stop(signal);
  healthServer?.close();
}

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

main().catch((err) => {
  console.error('Не вдалося запустити бота:', err);
  process.exit(1);
});
