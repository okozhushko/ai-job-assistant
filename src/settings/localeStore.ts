import { db } from '../storage/db';
import type { Locale } from '../i18n/messages';

const getStmt = db.prepare('SELECT locale FROM user_locale WHERE telegram_user_id = ?');
const setStmt = db.prepare(`
  INSERT INTO user_locale (telegram_user_id, locale) VALUES (?, ?)
  ON CONFLICT(telegram_user_id) DO UPDATE SET locale = excluded.locale
`);

export function getLocale(userId: string): Locale | undefined {
  const row = getStmt.get(Number(userId)) as { locale: Locale } | undefined;
  return row?.locale;
}

export function setLocale(userId: string, locale: Locale): void {
  setStmt.run(Number(userId), locale);
}
