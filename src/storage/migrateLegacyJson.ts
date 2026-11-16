import { existsSync, readFileSync, renameSync } from 'node:fs';
import path from 'node:path';
import { DATA_DIR, db } from './db';

const LEGACY_SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const LEGACY_SEEN_FILE = path.join(DATA_DIR, 'seen-vacancies.json');

interface LegacyUserSettings {
  telegramUserId: number;
  jobTitles: string[];
  stack: string[];
  countries: string[];
  sources: string[];
  createdAt: string;
  updatedAt: string;
}

// Одноразова міграція з попереднього JSON-файлового сховища (гонка при
// одночасному записі) на SQLite. Мігровані файли перейменовуються з
// суфіксом .migrated, щоб цей блок не спрацьовував повторно.
export function migrateLegacyJsonIfNeeded(): void {
  if (existsSync(LEGACY_SETTINGS_FILE)) {
    const raw = JSON.parse(readFileSync(LEGACY_SETTINGS_FILE, 'utf-8')) as Record<
      string,
      LegacyUserSettings
    >;
    const upsert = db.prepare(`
      INSERT INTO user_settings (telegram_user_id, job_titles, stack, countries, sources, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(telegram_user_id) DO NOTHING
    `);
    for (const settings of Object.values(raw)) {
      upsert.run(
        settings.telegramUserId,
        JSON.stringify(settings.jobTitles),
        JSON.stringify(settings.stack),
        JSON.stringify(settings.countries),
        JSON.stringify(settings.sources),
        settings.createdAt,
        settings.updatedAt,
      );
    }
    renameSync(LEGACY_SETTINGS_FILE, `${LEGACY_SETTINGS_FILE}.migrated`);
    console.log('[migrate] settings.json перенесено в SQLite');
  }

  if (existsSync(LEGACY_SEEN_FILE)) {
    const raw = JSON.parse(readFileSync(LEGACY_SEEN_FILE, 'utf-8')) as Record<string, string[]>;
    const insert = db.prepare(
      'INSERT OR IGNORE INTO seen_vacancies (telegram_user_id, vacancy_id) VALUES (?, ?)',
    );
    for (const [userId, vacancyIds] of Object.entries(raw)) {
      for (const vacancyId of vacancyIds) {
        insert.run(Number(userId), vacancyId);
      }
    }
    renameSync(LEGACY_SEEN_FILE, `${LEGACY_SEEN_FILE}.migrated`);
    console.log('[migrate] seen-vacancies.json перенесено в SQLite');
  }
}
