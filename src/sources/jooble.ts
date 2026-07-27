import type { JobSource, SearchQuery } from './types';
import type { Vacancy } from '../domain/types';
import { env } from '../config/env';

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

    const keywords = [query.jobTitle, ...query.stack].join(' ');
    const response = await fetch(`https://${host}/api/${env.JOOBLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords }),
    });

    if (!response.ok) {
      throw new Error(`Jooble API повернув статус ${response.status}`);
    }

    const data = (await response.json()) as JoobleResponse;
    return data.jobs.map((job) => ({
      id: `jooble:${job.id}`,
      source: 'jooble',
      title: job.title,
      company: job.company || undefined,
      location: job.location || undefined,
      url: job.link,
      description: job.snippet,
      publishedAt: job.updated,
      salary: job.salary || undefined,
    }));
  },
};
