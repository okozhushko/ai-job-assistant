import type { Vacancy } from '../domain/types';

export interface SearchQuery {
  jobTitle: string;
  stack: string[];
  country: string;
}

export interface JobSource {
  id: string;
  name: string;
  search(query: SearchQuery): Promise<Vacancy[]>;
}
