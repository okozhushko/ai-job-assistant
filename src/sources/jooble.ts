import type { JobSource, SearchQuery } from './types';
import type { Vacancy } from '../domain/types';
import { env } from '../config/env';
import { fetchWithRetry, sleep } from './httpUtils';

// Невелика пауза між послідовними запитами по синонімах посади — знижує
// шанс впертись у rate-limit джерела, особливо коли з ботом працює
// кілька користувачів одночасно.
const REQUEST_SPACING_MS = 300;

// Jooble фільтрує країну через параметр location у тілі запиту, а не через
// піддомен (ua./pl./es.jooble.org повертають 403 для звичайного API-ключа —
// доступ дозволено лише на загальному jooble.org).
const COUNTRY_LOCATIONS: Record<string, string> = {
  UA: 'Ukraine',
  PL: 'Poland',
  ES: 'Spain',
};

interface JoobleJob {
  id: string;
  title: string;
  location: string;
  snippet: string;
  salary: string;
  company: string;
  link: string;
  updated: string;
}

interface JoobleResponse {
  totalCount: number;
  jobs: JoobleJob[];
}

export const joobleSource: JobSource = {
  id: 'jooble',
  name: 'Jooble',
  async search(query: SearchQuery): Promise<Vacancy[]> {
    if (!env.JOOBLE_API_KEY) {
      console.warn('[jooble] JOOBLE_API_KEY не задано, джерело пропущено');
      return [];
    }
    const location = COUNTRY_LOCATIONS[query.country];
    if (!location) {
      console.warn(`[jooble] країна ${query.country} не підтримується`);
      return [];
    }

    // Jooble не має OR-параметра для ключових слів, тож кожен варіант назви
    // посади шукаємо окремим запитом (дублікати прибираються вище, у searchService).
    const results: Vacancy[] = [];
    let successCount = 0;
    let failureCount = 0;

    for (const [index, jobTitle] of query.jobTitles.entries()) {
      if (index > 0) {
        await sleep(REQUEST_SPACING_MS);
      }

      const keywords = [jobTitle, ...query.stack].join(' ');
      try {
        const response = await fetchWithRetry(`https://jooble.org/api/${env.JOOBLE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ keywords, location }),
        });

        if (!response.ok) {
          throw new Error(`Jooble API повернув статус ${response.status}`);
        }

        const data = (await response.json()) as JoobleResponse;
        for (const job of data.jobs) {
          results.push({
            id: `jooble:${job.id}`,
            source: 'jooble',
            title: job.title,
            company: job.company || undefined,
            location: job.location || undefined,
            url: job.link,
            description: job.snippet,
            publishedAt: job.updated,
            salary: job.salary || undefined,
          });
        }
        successCount++;
      } catch (err) {
        failureCount++;
        console.error(`[jooble] запит для "${jobTitle}" (${query.country}) не вдався:`, err);
      }
    }

    // Якщо взагалі жоден запит не пройшов — джерело недоступне для цієї
    // країни, а не просто "нічого не знайдено". searchService це побачить
    // і зможе попередити користувача, замість тихо показати порожній список.
    if (successCount === 0 && failureCount > 0) {
      throw new Error(`Jooble: усі ${failureCount} запит(и) для ${query.country} не вдалися`);
    }
    return results;
  },
};
