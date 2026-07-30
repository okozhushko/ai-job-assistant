import { db } from '../storage/db';
import type { UserSettings } from '../domain/types';

interface UserSettingsRow {
  telegram_user_id: number;
  job_titles: string;
  stack: string;
  exclude_keywords: string;
  countries: string;
  sources: string;
  paused: number;
  created_at: string;
  updated_at: string;
}

const getStmt = db.prepare('SELECT * FROM user_settings WHERE telegram_user_id = ?');
const getAllStmt = db.prepare('SELECT * FROM user_settings');
const upsertStmt = db.prepare(`
  INSERT INTO user_settings (telegram_user_id, job_titles, stack, exclude_keywords, countries, sources, paused, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(telegram_user_id) DO UPDATE SET
    job_titles = excluded.job_titles,
    stack = excluded.stack,
    exclude_keywords = excluded.exclude_keywords,
    countries = excluded.countries,
    sources = excluded.sources,
    paused = excluded.paused,
    updated_at = excluded.updated_at
`);
const setPausedStmt = db.prepare('UPDATE user_settings SET paused = ? WHERE telegram_user_id = ?');

function toSettings(row: UserSettingsRow): UserSettings {
  return {
    telegramUserId: row.telegram_user_id,
    jobTitles: JSON.parse(row.job_titles) as string[],
    stack: JSON.parse(row.stack) as string[],
    excludeKeywords: JSON.parse(row.exclude_keywords) as string[],
    countries: JSON.parse(row.countries) as string[],
    sources: JSON.parse(row.sources) as string[],
    paused: row.paused === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function getSettings(userId: string): UserSettings | undefined {
  const row = getStmt.get(Number(userId)) as unknown as UserSettingsRow | undefined;
  return row ? toSettings(row) : undefined;
}

export function saveSettings(settings: UserSettings): void {
  upsertStmt.run(
    settings.telegramUserId,
    JSON.stringify(settings.jobTitles),
    JSON.stringify(settings.stack),
    JSON.stringify(settings.excludeKeywords),
    JSON.stringify(settings.countries),
    JSON.stringify(settings.sources),
    settings.paused ? 1 : 0,
    settings.createdAt,
    settings.updatedAt,
  );
}

export function setPaused(userId: string, paused: boolean): void {
  setPausedStmt.run(paused ? 1 : 0, Number(userId));
}

export function getAllSettings(): UserSettings[] {
  const rows = getAllStmt.all() as unknown as UserSettingsRow[];
  return rows.map(toSettings);
}
