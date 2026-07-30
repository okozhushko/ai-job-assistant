export interface Vacancy {
  id: string;
  source: string;
  title: string;
  company?: string;
  location?: string;
  url: string;
  description?: string;
  publishedAt?: string;
  salary?: string;
}

export interface UserSettings {
  telegramUserId: number;
  jobTitles: string[];
  stack: string[];
  excludeKeywords: string[];
  countries: string[];
  sources: string[];
  paused: boolean;
  createdAt: string;
  updatedAt: string;
}
