import type { JobSource, SearchQuery } from './types';
import type { Vacancy } from '../domain/types';
import { env } from '../config/env';

// Adzuna не покриває Україну — тільки країни зі свого офіційного списку.
const SUPPORTED_COUNTRIES: Record<string, string> = {
  PL: 'pl',
  ES: 'es',
};

interface AdzunaResult {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  redirect_url: string;
  description?: string;
  created?: string;
  salary_min?: number;
  salary_max?: number;
}

interface AdzunaResponse {
  results: AdzunaResult[];
}

export const adzunaSource: JobSource = {
  id: 'adzuna',
  name: 'Adzuna',
  async search(query: SearchQuery): Promise<Vacancy[]> {
    if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
      console.warn('[adzuna] ADZUNA_APP_ID/ADZUNA_APP_KEY не задано, джерело пропущено');
      return [];
    }
    const countryCode = SUPPORTED_COUNTRIES[query.country];
    if (!countryCode) {
      console.warn(`[adzuna] країна ${query.country} не підтримується Adzuna`);
      return [];
    }

    const what = [query.jobTitle, ...query.stack].join(' ');
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${countryCode}/search/1`);
    url.searchParams.set('app_id', env.ADZUNA_APP_ID);
    url.searchParams.set('app_key', env.ADZUNA_APP_KEY);
    url.searchParams.set('what', what);
    url.searchParams.set('results_per_page', '20');
    url.searchParams.set('content-type', 'application/json');

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Adzuna API повернув статус ${response.status}`);
    }

    const data = (await response.json()) as AdzunaResponse;
    return data.results.map((item) => ({
      id: `adzuna:${item.id}`,
      source: 'adzuna',
      title: item.title,
      company: item.company?.display_name,
      location: item.location?.display_name,
      url: item.redirect_url,
      description: item.description,
      publishedAt: item.created,
      salary: item.salary_min ? `${item.salary_min}–${item.salary_max ?? ''}` : undefined,
    }));
  },
};
