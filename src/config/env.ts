import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1, 'TELEGRAM_BOT_TOKEN є обов’язковим'),
  JOOBLE_API_KEY: z.string().optional(),
  ADZUNA_APP_ID: z.string().optional(),
  ADZUNA_APP_KEY: z.string().optional(),
  SEARCH_INTERVAL_CRON: z.string().default('0 */6 * * *'),
});

export const env = envSchema.parse(process.env);
