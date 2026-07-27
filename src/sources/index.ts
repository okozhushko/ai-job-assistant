import type { JobSource } from './types';
import { joobleSource } from './jooble';
import { adzunaSource } from './adzuna';

const registry: Record<string, JobSource> = {
  [joobleSource.id]: joobleSource,
  [adzunaSource.id]: adzunaSource,
};

export function getSources(ids: string[]): JobSource[] {
  return ids.map((id) => registry[id]).filter((s): s is JobSource => Boolean(s));
}

export function getAllSources(): JobSource[] {
  return Object.values(registry);
}
