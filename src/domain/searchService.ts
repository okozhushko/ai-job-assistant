import { getSources } from '../sources';
import { filterNew, markSeen } from '../storage/vacancyStore';
import type { UserSettings, Vacancy } from './types';

export async function runSearchForUser(settings: UserSettings): Promise<Vacancy[]> {
  const sources = getSources(settings.sources);
  // Map, а не масив: одна й та сама вакансія може знайтись під кількома
  // синонімами назви посади (jobTitles), дублікати прибираємо по id.
  const found = new Map<string, Vacancy>();

  for (const country of settings.countries) {
    for (const source of sources) {
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
        console.error(`[search] джерело ${source.id} не відповіло для ${country}:`, err);
      }
    }
  }

  const userId = String(settings.telegramUserId);
  const fresh = await filterNew(userId, Array.from(found.values()));
  await markSeen(userId, fresh);
  return fresh;
}
