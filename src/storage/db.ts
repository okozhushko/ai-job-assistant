import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_PATH = path.join(DATA_DIR, 'bot.sqlite');

if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  CREATE TABLE IF NOT EXISTS user_settings (
    telegram_user_id INTEGER PRIMARY KEY,
    job_titles TEXT NOT NULL,
    stack TEXT NOT NULL,
    countries TEXT NOT NULL,
    sources TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS seen_vacancies (
    telegram_user_id INTEGER NOT NULL,
    vacancy_id TEXT NOT NULL,
    PRIMARY KEY (telegram_user_id, vacancy_id)
  );

  CREATE TABLE IF NOT EXISTS blocked_companies (
    telegram_user_id INTEGER NOT NULL,
    company TEXT NOT NULL,
    PRIMARY KEY (telegram_user_id, company)
  );

  CREATE TABLE IF NOT EXISTS user_locale (
    telegram_user_id INTEGER PRIMARY KEY,
    locale TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS applied_vacancies (
    telegram_user_id INTEGER NOT NULL,
    vacancy_id TEXT NOT NULL,
    PRIMARY KEY (telegram_user_id, vacancy_id)
  );
`);

// Легка еволюція схеми без окремого фреймворку міграцій: додаємо колонку,
// якщо її ще немає. SQLite кине помилку "duplicate column name", якщо вона
// вже застосована раніше — це і є сигнал "нічого робити не треба".
function addColumnIfMissing(sql: string): void {
  try {
    db.exec(sql);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // Ловимо лише очікувану помилку "колонка вже існує" — будь-яку іншу
    // (заблокована БД, помилка в SQL і т.д.) не можна тихо ковтати.
    if (!message.includes('duplicate column name')) {
      throw err;
    }
  }
}

addColumnIfMissing(
  "ALTER TABLE user_settings ADD COLUMN exclude_keywords TEXT NOT NULL DEFAULT '[]'",
);
addColumnIfMissing('ALTER TABLE user_settings ADD COLUMN paused INTEGER NOT NULL DEFAULT 0');
addColumnIfMissing('ALTER TABLE seen_vacancies ADD COLUMN company TEXT');
