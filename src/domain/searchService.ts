import { getSources } from '../sources';
import { filterNew, getBlockedCompanies } from '../storage/vacancyStore';
import {
  dedupeByFingerprint,
  isFresh,
  matchesExcludeKeywords,
  sortByRecency,
} from './vacancyFilters';
import type { UserSettings, Vacancy } from './types';

export interface SearchResult {
  vacancies: Vacancy[];
  // id джерел, які не відповіли жодного разу за весь прогін (усі країни) —
  // на відміну від часткового збою, вартий явного попередження користувачу.
  failedSources: string[];
}

export async function runSearchForUser(settings: UserSettings): Promise<SearchResult> {
  const sources = getSources(settings.sources);
  // Map, а не масив: одна й та сама вакансія може знайтись під кількома
  // синонімами назви посади (jobTitles), дублікати прибираємо по id.
  const found = new Map<string, Vacancy>();
  const attempts = new Map<string, number>();
  const failures = new Map<string, number>();

  for (const country of settings.countries) {
    for (const source of sources) {
      attempts.set(source.id, (attempts.get(source.id) ?? 0) + 1);
      try {
        const results = await source.search({
          jobTitles: settings.jobTitles,
          stack: settings.stack,
          country,
        });
        for (const vacancy of results) {
          found.set(vacancy.id, vacancy);
        }
      } catch (err) {
        failures.set(source.id, (failures.get(source.id) ?? 0) + 1);
        console.error(`[search] джерело ${source.id} не відповіло для ${country}:`, err);
      }
    }
  }

  const failedSources = sources
    .filter(
      (source) =>
        (failures.get(source.id) ?? 0) > 0 && failures.get(source.id) === attempts.get(source.id),
    )
    .map((source) => source.id);

  const userId = String(settings.telegramUserId);
  const blockedCompanies = getBlockedCompanies(userId);

  const candidates = dedupeByFingerprint(Array.from(found.values()))
    .filter((v) => isFresh(v))
    .filter((v) => !matchesExcludeKeywords(v, settings.excludeKeywords))
    .filter((v) => !v.company || !blockedCompanies.has(v.company.toLowerCase()));

  // markSeen навмисно НЕ викликається тут: показуємо (і, відповідно,
  // позначаємо "побаченими") лише той зріз, який реально відправляємо
  // користувачу — це роблять виклики search.ts/searchScheduler.ts.
  // Якщо позначити тут усі fresh, а показати лише перші N — решта
  // "зникне" назавжди, хоча користувач їх ніколи не бачив.
  const fresh = filterNew(userId, candidates);
  return { vacancies: sortByRecency(fresh), failedSources };
}
