import type { Context } from 'telegraf';
import { uk } from './uk';
import { en } from './en';
import { getLocale } from '../settings/localeStore';
import type { Locale, Messages } from './messages';

export type { Locale, Messages };

const MESSAGES: Record<Locale, Messages> = { uk, en };

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}

// Автовизначення: Telegram передає language_code клієнта з кожним update.
// Явний вибір через /language (localeStore) завжди має пріоритет.
export function detectLocale(languageCode?: string): Locale {
  return (languageCode ?? '').toLowerCase().startsWith('uk') ? 'uk' : 'en';
}

export function resolveLocale(ctx: Context): Locale {
  const userId = ctx.from?.id;
  if (userId !== undefined) {
    const stored = getLocale(String(userId));
    if (stored) return stored;
  }
  return detectLocale(ctx.from?.language_code);
}

// Для фонового планувальника, де немає ctx (не прив'язано до update) —
// лише збережене вподобання, з фолбеком на англійську.
export function resolveStoredLocale(userId: string): Locale {
  return getLocale(userId) ?? 'en';
}

export function t(ctx: Context): Messages {
  return getMessages(resolveLocale(ctx));
}
