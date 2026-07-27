import { getSources } from '../sources';
import { filterNew, markSeen } from '../storage/vacancyStore';
import type { UserSettings, Vacancy } from './types';

export async function runSearchForUser(settings: UserSettings): Promise<Vacancy[]> {
  const sources = getSources(settings.sources);
  const found: Vacancy[] = [];

  for (const country of settings.countries) {
    for (const source of sources) {
      try {
        const results = await source.search({
          jobTitle: settings.jobTitle,
          stack: settings.stack,
          country,
        });
        found.push(...results);
      } catch (err) {
        console.error(`[search] джерело ${source.id} не відповіло для ${country}:`, err);
      }
    }
  }

  const userId = String(settings.telegramUserId);
  const fresh = await filterNew(userId, found);
  await markSeen(userId, fresh);
  return fresh;
}
