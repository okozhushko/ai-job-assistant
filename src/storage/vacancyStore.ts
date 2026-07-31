import { db } from './db';
import type { Vacancy } from '../domain/types';

const existsStmt = db.prepare(
  'SELECT 1 FROM seen_vacancies WHERE telegram_user_id = ? AND vacancy_id = ?',
);
const insertStmt = db.prepare(
  'INSERT OR IGNORE INTO seen_vacancies (telegram_user_id, vacancy_id, company) VALUES (?, ?, ?)',
);
const getCompanyStmt = db.prepare(
  'SELECT company FROM seen_vacancies WHERE telegram_user_id = ? AND vacancy_id = ?',
);
const blockCompanyStmt = db.prepare(
  'INSERT OR IGNORE INTO blocked_companies (telegram_user_id, company) VALUES (?, ?)',
);
const getBlockedCompaniesStmt = db.prepare(
  'SELECT company FROM blocked_companies WHERE telegram_user_id = ?',
);
const clearSeenStmt = db.prepare('DELETE FROM seen_vacancies WHERE telegram_user_id = ?');
const markAppliedStmt = db.prepare(
  'INSERT OR IGNORE INTO applied_vacancies (telegram_user_id, vacancy_id) VALUES (?, ?)',
);
const isAppliedStmt = db.prepare(
  'SELECT 1 FROM applied_vacancies WHERE telegram_user_id = ? AND vacancy_id = ?',
);

export function filterNew(userId: string, vacancies: Vacancy[]): Vacancy[] {
  const id = Number(userId);
  return vacancies.filter((v) => existsStmt.get(id, v.id) === undefined);
}

export function markSeen(userId: string, vacancies: Vacancy[]): void {
  const id = Number(userId);
  for (const v of vacancies) {
    insertStmt.run(id, v.id, v.company ?? null);
  }
}

export function getVacancyCompany(userId: string, vacancyId: string): string | undefined {
  const row = getCompanyStmt.get(Number(userId), vacancyId) as
    { company: string | null } | undefined;
  return row?.company ?? undefined;
}

export function blockCompany(userId: string, company: string): void {
  blockCompanyStmt.run(Number(userId), company);
}

export function getBlockedCompanies(userId: string): Set<string> {
  const rows = getBlockedCompaniesStmt.all(Number(userId)) as { company: string }[];
  return new Set(rows.map((r) => r.company.toLowerCase()));
}

// Прибирає позначки "вже показано" — наступний /search знову покаже всі
// вакансії, що підходять під фільтри, навіть якщо їх показували раніше.
export function clearSeen(userId: string): number {
  const result = clearSeenStmt.run(Number(userId));
  return Number(result.changes);
}

// "Подано заявку" зберігається окремо від seen_vacancies і не чиститься
// через /clear - на відміну від "показано", це рішення користувача, яке
// не мало б зникати випадково.
export function markApplied(userId: string, vacancyId: string): void {
  markAppliedStmt.run(Number(userId), vacancyId);
}

export function isApplied(userId: string, vacancyId: string): boolean {
  return isAppliedStmt.get(Number(userId), vacancyId) !== undefined;
}
