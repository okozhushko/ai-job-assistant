import type { Vacancy } from './types';

// Вакансії старші цього порогу приховуємо — старі оголошення здебільшого
// вже закриті/неактуальні. Фіксоване значення для простоти; можна винести
// в налаштування користувача пізніше, якщо знадобиться.
const MAX_AGE_DAYS = 45;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[^\p{L}\p{N} ]/gu, '');
}

// Ключ для дедуплікації тієї самої вакансії, знайденої різними джерелами —
// у них різні id (з префіксом джерела), тож зіставляємо по назві+компанії.
// Локація теж входить у ключ: та сама компанія може відкрити однакову
// позицію в різних країнах одночасно — це різні вакансії, не дублікат.
function fingerprint(vacancy: Vacancy): string {
  return `${normalize(vacancy.title)}|${normalize(vacancy.company ?? '')}|${normalize(vacancy.location ?? '')}`;
}

export function dedupeByFingerprint(vacancies: Vacancy[]): Vacancy[] {
  const seen = new Set<string>();
  const result: Vacancy[] = [];
  for (const vacancy of vacancies) {
    const fp = fingerprint(vacancy);
    if (seen.has(fp)) continue;
    seen.add(fp);
    result.push(vacancy);
  }
  return result;
}

// Якщо дату публікації не вдалось розпарсити або її взагалі немає —
// не відкидаємо вакансію лише через брак даних.
export function isFresh(vacancy: Vacancy, maxAgeDays: number = MAX_AGE_DAYS): boolean {
  if (!vacancy.publishedAt) return true;
  const publishedMs = Date.parse(vacancy.publishedAt);
  if (Number.isNaN(publishedMs)) return true;
  return Date.now() - publishedMs <= maxAgeDays * 24 * 60 * 60 * 1000;
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Зіставлення по межах слова, а не будь-яке входження підрядка — інакше
// коротке ключове слово на кшталт "AI" ловило б "domain", "retail" тощо.
export function matchesExcludeKeywords(vacancy: Vacancy, excludeKeywords: string[]): boolean {
  if (excludeKeywords.length === 0) return false;
  const haystack = `${vacancy.title} ${vacancy.description ?? ''}`;
  return excludeKeywords.some((keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) return false;
    return new RegExp(`\\b${escapeRegExp(trimmed)}\\b`, 'iu').test(haystack);
  });
}

// Найновіші публікації — першими. Вакансії з невідомою/непарсибельною
// датою йдуть в кінець, а не на початок і не в довільному порядку.
export function sortByRecency(vacancies: Vacancy[]): Vacancy[] {
  return [...vacancies].sort((a, b) => {
    const aTime = a.publishedAt ? Date.parse(a.publishedAt) : NaN;
    const bTime = b.publishedAt ? Date.parse(b.publishedAt) : NaN;
    const aValid = !Number.isNaN(aTime);
    const bValid = !Number.isNaN(bTime);
    if (aValid && bValid) return bTime - aTime;
    if (aValid) return -1;
    if (bValid) return 1;
    return 0;
  });
}
