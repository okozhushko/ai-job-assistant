import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { JobSource, SearchQuery } from './types';
import type { Vacancy } from '../domain/types';
import { env } from '../config/env';

const execFileAsync = promisify(execFile);

// Jooble API розподілений по країнах: кожна країна має власний хост.
const COUNTRY_HOSTS: Record<string, string> = {
  UA: 'ua.jooble.org',
  PL: 'pl.jooble.org',
  ES: 'es.jooble.org',
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
    const host = COUNTRY_HOSTS[query.country];
    if (!host) {
      console.warn(`[jooble] країна ${query.country} не підтримується`);
      return [];
    }

    // Jooble не має OR-параметра для ключових слів, тож кожен варіант назви
    // посади шукаємо окремим запитом (дублікати прибираються вище, у searchService).
    const results: Vacancy[] = [];
    for (const jobTitle of query.jobTitles) {
      const keywords = [jobTitle, ...query.stack].join(' ');
      try {
        // Node-івський fetch/https отримує 403 від Cloudflare на боці Jooble
        // (TLS-фінгерпринтинг блокує запити не з браузера/curl) навіть з
        // валідним ключем — curl такий самий запит проходить без проблем,
        // тому цей запит виконується через підпроцес curl, а не fetch().
        const { stdout } = await execFileAsync('curl', [
          '-sS',
          '-f',
          '--max-time',
          '15',
          '-X',
          'POST',
          `https://${host}/api/${env.JOOBLE_API_KEY}`,
          '-H',
          'Content-Type: application/json',
          '-d',
          JSON.stringify({ keywords }),
        ]);

        const data = JSON.parse(stdout) as JoobleResponse;
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
      } catch (err) {
        console.error(`[jooble] запит для "${jobTitle}" (${query.country}) не вдався:`, err);
      }
    }
    return results;
  },
};
