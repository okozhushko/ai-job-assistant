import type { Vacancy } from '../domain/types';

export interface SearchQuery {
  jobTitles: string[];
  stack: string[];
  country: string;
}

export interface JobSource {
  id: string;
  name: string;
  search(query: SearchQuery): Promise<Vacancy[]>;
}
